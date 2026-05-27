// p0_routes.js — P0 功能路由：专家日程、订单关联评价
// 调用方式：require('./p0_routes.js')(app, requireAuth, requireExpert, sanitizeObj);
// 自动取消逻辑已移至 app.js（避免 db 未初始化时报错）

module.exports = function(app, requireAuth, requireExpert, sanitizeObj) {
  const { query, get, run, save } = require('./database.js');
  const pushService = require('./pushService');

  // ===== Expert Schedule Management (P0 #1) =====

  // 获取当前专家的日程设置
  app.get('/api/expert/schedule', requireAuth, requireExpert, (req, res) => {
    const list = query('SELECT * FROM expert_schedule WHERE expert_id = ? ORDER BY day_of_week, start_time', [req.expertId]);
    const timeOff = query('SELECT * FROM expert_time_off WHERE expert_id = ? AND off_date >= date("now") ORDER BY off_date', [req.expertId]);
    res.json({ schedule: list, time_off: timeOff });
  });

  // 更新专家每周日程
  app.put('/api/expert/schedule', requireAuth, requireExpert, (req, res) => {
    const { schedule } = req.body;
    if (!Array.isArray(schedule)) return res.status(400).json({ error: '格式错误' });
    run('DELETE FROM expert_schedule WHERE expert_id = ?', [req.expertId]);
    for (const s of schedule) {
      if (s.start_time && s.end_time) {
        run('INSERT INTO expert_schedule (expert_id, day_of_week, start_time, end_time, is_available) VALUES (?, ?, ?, ?, ?)',
          [req.expertId, s.day_of_week, s.start_time, s.end_time, s.is_available !== false ? 1 : 0]);
      }
    }
    save();
    res.json({ success: true });
  });

  // 添加/更新请假日期
  app.post('/api/expert/time-off', requireAuth, requireExpert, (req, res) => {
    const { off_date, reason } = sanitizeObj(req.body);
    if (!off_date) return res.status(400).json({ error: '日期必填' });
    run('INSERT OR REPLACE INTO expert_time_off (expert_id, off_date, reason) VALUES (?, ?, ?)', [req.expertId, off_date, reason || '']);
    save();
    res.json({ success: true });
  });

  // 删除请假日期
  app.delete('/api/expert/time-off/:date', requireAuth, requireExpert, (req, res) => {
    run('DELETE FROM expert_time_off WHERE expert_id = ? AND off_date = ?', [req.expertId, req.params.date]);
    save();
    res.json({ success: true });
  });

  // 获取某专家某天的可预约时间段（前端预订时调用）
  app.get('/api/experts/:id/available-slots', (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: '缺少日期参数' });
    const expertId = req.params.id;
    const dayOfWeek = new Date(date).getDay(); // 0=Sun..6=Sat
    // 检查是否请假
    const timeOff = get('SELECT id FROM expert_time_off WHERE expert_id = ? AND off_date = ?', [expertId, date]);
    if (timeOff) return res.json({ slots: [] });
    // 获取该日每周可用时段
    const weeklySlots = query('SELECT * FROM expert_schedule WHERE expert_id = ? AND day_of_week = ? AND is_available = 1', [expertId, dayOfWeek]);
    // 获取已被预约的时段
    const booked = query('SELECT start_time FROM expert_booked_slots WHERE expert_id = ? AND booking_date = ?', [expertId, date]);
    const bookedSet = new Set(booked.map(b => b.start_time));
    // 生成30分钟粒度的时间槽
    let slots = [];
    for (const ws of weeklySlots) {
      const [sh, sm] = ws.start_time.split(':').map(Number);
      const [eh, em] = ws.end_time.split(':').map(Number);
      let cur = sh * 60 + sm;
      const end = eh * 60 + em;
      while (cur + 30 <= end) {
        const hh = String(Math.floor(cur / 60)).padStart(2, '0');
        const mm = String(cur % 60).padStart(2, '0');
        const t = hh + ':' + mm;
        if (!bookedSet.has(t)) slots.push(t);
        cur += 30;
      }
    }
    res.json({ slots });
  });

  // ===== Order-linked Reviews (P0 #2) =====

  // 创建评价（必须与已完成的订单关联）
  app.post('/api/experts/:id/reviews', requireAuth, (req, res) => {
    const expertId = req.params.id;
    const { rating, content, booking_id } = sanitizeObj(req.body);
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: '评分必须为1-5' });

    if (booking_id) {
      // 必须关联一个已完成的订单
      const booking = get(
        'SELECT * FROM bookings WHERE id = ? AND user_id = ? AND expert_id = ? AND status = ?',
        [booking_id, req.session.userId, expertId, 'completed']
      );
      if (!booking) return res.status(400).json({ error: '无效的订单，只能评价已完成的预约' });
      // 同一订单只能评价一次
      const existing = get('SELECT id FROM reviews WHERE booking_id = ?', [booking_id]);
      if (existing) return res.status(400).json({ error: '该订单已评价' });
    }

    // 防止重复评价（无订单时按专家维度限制）
    const existingAny = get('SELECT id FROM reviews WHERE expert_id = ? AND user_id = ?', [expertId, req.session.userId]);
    if (existingAny && !booking_id) return res.status(400).json({ error: '您已评价过该专家' });

    run(
      'INSERT INTO reviews (expert_id, user_id, rating, content, booking_id) VALUES (?, ?, ?, ?, ?)',
      [expertId, req.session.userId, rating, content || '', booking_id || null]
    );

    // 更新专家平均分
    const stats = get('SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE expert_id = ?', [expertId]);
    run('UPDATE experts SET avg_rating = ?, review_count = ? WHERE id = ?', [stats.avg || 0, stats.cnt || 0, expertId]);
    save();
    res.json({ success: true });
  });

  console.log('✅ P0 功能路由已加载（日程管理 + 订单关联评价）');
};
