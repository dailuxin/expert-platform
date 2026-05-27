// public/packages.js — 服务套餐管理（独立文件，避免 index.html 注入问题）

async function renderServicePackages() {
  const list = await fetchJSON(API + '/expert/packages');
  let h = '<div class="section-title">服务套餐管理';
  h += ' <button class="btn btn-sm" onclick="renderPackageForm()" style="float:right">+ 新建套餐</button>';
  h += '</div>';

  if (!list || !list.length) {
    h += '<div class="empty"><div class="icon">📦</div>暂无服务套餐，点击「新建套餐」添加</div>';
  } else {
    for (const p of list) {
      h += '<div class="pkg-card">';
      h += '<div style="font-weight:600;font-size:16px">' + escHtml(p.name) + '</div>';
      h += '<div style="font-size:13px;color:#718096;margin-top:4px">' + escHtml(p.description || '暂无描述') + '</div>';
      h += '<div class="pkg-price">¥' + (p.price / 100).toFixed(2) + ' 元</div>';
      h += '<div class="pkg-duration">时长：' + p.duration + ' 分钟</div>';
      h += '<div class="pkg-actions">';
      h += '<button class="btn btn-sm btn-outline" onclick="renderPackageForm(' + p.id + ')">编辑</button> ';
      h += '<button class="btn btn-sm btn-danger" onclick="deletePackage(' + p.id + ')">删除</button>';
      h += '</div></div>';
    }
  }
  document.getElementById('app').innerHTML = h;
}

function renderPackageForm(id) {
  const isEdit = !!id;
  let h = '<div class="section-title">' + (isEdit ? '编辑套餐' : '新建套餐');
  h += ' <button class="btn btn-sm btn-outline" onclick="renderServicePackages()" style="float:right">返回</button>';
  h += '</div>';
  h += '<div class="card"><form id="pkgForm">';
  h += '<div class="form-group"><label>套餐名称 *</label><input name="name" required placeholder="如：1小时咨询"></div>';
  h += '<div class="form-group"><label>描述</label><textarea name="description" rows="3" placeholder="套餐说明"></textarea></div>';
  h += '<div class="form-group"><label>价格（元）*</label><input name="price" type="number" min="0" step="0.01" required placeholder="0.00"></div>';
  h += '<div class="form-group"><label>时长（分钟）</label><input name="duration" type="number" min="1" value="60" placeholder="60"></div>';
  h += '<button type="submit" class="btn">保存</button> ';
  h += '<button type="button" class="btn btn-outline" onclick="renderServicePackages()">取消</button>';
  h += '</form></div>';
  document.getElementById('app').innerHTML = h;

  if (isEdit) {
    fetchJSON(API + '/expert/packages').then(list => {
      const p = list.find(x => x.id === id);
      if (!p) return;
      document.querySelector('[name="name"]').value = p.name;
      document.querySelector('[name="description"]').value = p.description || '';
      document.querySelector('[name="price"]').value = p.price / 100;
      document.querySelector('[name="duration"]').value = p.duration;
    });
  }

  document.getElementById('pkgForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = {
      name: fd.get('name'),
      description: fd.get('description'),
      price: Math.round(parseFloat(fd.get('price')) * 100),
      duration: parseInt(fd.get('duration')) || 60
    };
    if (isEdit) {
      await fetch(API + '/expert/packages/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } else {
      await fetch(API + '/expert/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    }
    alert('保存成功');
    renderServicePackages();
  });
}

async function deletePackage(id) {
  if (!confirm('确定删除该套餐？')) return;
  await fetch(API + '/expert/packages/' + id, { method: 'DELETE' });
  alert('已删除');
  renderServicePackages();
}
