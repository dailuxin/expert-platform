// ===== 注册流程 + 任务发布 前端 =====

// ========== 注册页面 ==========
function renderRegisterPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="register-v2">
      <h1 class="reg-title">创建账号</h1>
      <p class="reg-subtitle">选择您的身份类型</p>
      
      <!-- 角色选择 -->
      <div class="role-selector" id="roleSelector">
        <div class="role-card active" onclick="selectRole('personal')" data-role="personal">
          <div class="role-icon">👤</div>
          <div class="role-name">个人用户</div>
          <div class="role-desc">咨询、发布任务、寻找专家</div>
        </div>
        <div class="role-card" onclick="selectRole('company')" data-role="company">
          <div class="role-icon">🏢</div>
          <div class="role-name">企业用户</div>
          <div class="role-desc">企业咨询、批量采购、项目合作</div>
        </div>
        <div class="role-card" onclick="selectRole('expert')" data-role="expert">
          <div class="role-icon">👨‍💼</div>
          <div class="role-name">入驻专家</div>
          <div class="role-desc">提供专业咨询、发布文章</div>
        </div>
      </div>

      <form id="registerForm" class="reg-form" onsubmit="handleRegister(event)">
        <!-- 通用字段 -->
        <div class="form-group">
          <label>用户名 <span class="req">*</span></label>
          <input name="username" placeholder="请输入用户名" required>
        </div>
        <div class="form-group">
          <label>密码 <span class="req">*</span></label>
          <input name="password" type="password" placeholder="至少6位" required minlength="6">
        </div>
        <div class="form-group">
          <label>真实姓名 <span class="req">*</span></label>
          <input name="real_name" placeholder="请输入真实姓名" required>
        </div>
        <div class="form-group">
          <label>手机号 <span class="req">*</span></label>
          <input name="phone" type="tel" placeholder="请输入手机号" required pattern="[0-9]{11}">
        </div>
        <div class="form-group">
          <label>邮箱</label>
          <input name="email" type="email" placeholder="选填">
        </div>

        <!-- 身份证上传（所有角色） -->
        <div class="form-section-title">📋 身份验证</div>
        <div class="upload-group">
          <div class="upload-item">
            <label>身份证正面 <span class="req">*</span></label>
            <div class="upload-box" onclick="document.getElementById('id_front').click()">
              <input type="file" id="id_front" name="id_card_front" accept="image/*" hidden onchange="previewUpload(this,'id_front_preview')">
              <div id="id_front_preview" class="upload-placeholder">📷 点击上传</div>
            </div>
          </div>
          <div class="upload-item">
            <label>身份证反面 <span class="req">*</span></label>
            <div class="upload-box" onclick="document.getElementById('id_back').click()">
              <input type="file" id="id_back" name="id_card_back" accept="image/*" hidden onchange="previewUpload(this,'id_back_preview')">
              <div id="id_back_preview" class="upload-placeholder">📷 点击上传</div>
            </div>
          </div>
        </div>

        <!-- 企业特有字段 -->
        <div id="companyFields" style="display:none">
          <div class="form-section-title">🏢 企业信息</div>
          <div class="form-group">
            <label>公司名称 <span class="req">*</span></label>
            <input name="company_name" placeholder="请输入公司全称" required>
          </div>
          <div class="form-group">
            <label>经营范围 <span class="req">*</span></label>
            <textarea name="business_scope" placeholder="请输入经营范围" required rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>营业执照 <span class="req">*</span></label>
            <div class="upload-box" onclick="document.getElementById('license').click()">
              <input type="file" id="license" name="business_license" accept="image/*,.pdf" hidden onchange="previewUpload(this,'license_preview')">
              <div id="license_preview" class="upload-placeholder">📄 点击上传营业执照</div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>企业联系人</label>
              <input name="contact_person" placeholder="选填">
            </div>
            <div class="form-group">
              <label>联系电话</label>
              <input name="contact_phone" type="tel" placeholder="选填">
            </div>
          </div>
          <div class="form-group">
            <label>企业邮箱</label>
            <input name="contact_email" type="email" placeholder="选填">
          </div>
        </div>

        <!-- 专家特有字段 -->
        <div id="expertFields" style="display:none">
          <div class="form-section-title">👨‍💼 专家资质</div>
          <div class="form-group">
            <label>专业领域 <span class="req">*</span></label>
            <select name="industry" required>
              <option value="">请选择</option>
              <option>心理咨询</option><option>法律咨询</option><option>职业规划</option>
              <option>财税顾问</option><option>教育辅导</option><option>医疗健康</option>
              <option>IT技术</option><option>设计创意</option><option>其他</option>
            </select>
          </div>
          <div class="form-group">
            <label>职称/头衔</label>
            <input name="title" placeholder="如：高级心理咨询师">
          </div>
          <div class="form-group">
            <label>专业特长</label>
            <input name="specialties" placeholder="多个用逗号分隔">
          </div>
          <div class="form-group">
            <label>个人简介</label>
            <textarea name="self_intro" placeholder="介绍您的专业背景和经验" rows="4"></textarea>
          </div>
          <div class="form-group">
            <label>资质证书（最多5张）</label>
            <div class="upload-box" onclick="document.getElementById('certs').click()">
              <input type="file" id="certs" name="certificates" accept="image/*,.pdf" multiple hidden onchange="previewMultiUpload(this,'certs_preview')">
              <div id="certs_preview" class="upload-placeholder">📁 点击上传证书</div>
            </div>
          </div>
          <div class="form-section-title">🆘 紧急联系人</div>
          <div class="form-row">
            <div class="form-group">
              <label>紧急联系人 <span class="req">*</span></label>
              <input name="emergency_contact" placeholder="必填" required>
            </div>
            <div class="form-group">
              <label>紧急联系电话 <span class="req">*</span></label>
              <input name="emergency_phone" type="tel" placeholder="必填" required>
            </div>
          </div>
        </div>

        <!-- 免责声明 -->
        <div class="disclaimer-box">
          <label class="disclaimer-label">
            <input type="checkbox" id="regAgree" required>
            <span>我已阅读并同意<a href="#" onclick="event.preventDefault();showRegDisclaimer()">《服务条款与免责声明》</a></span>
          </label>
          <div id="regDisclaimerText" class="disclaimer-content" style="display:none">
            <div class="terms-section">
              <strong>服务条款与免责声明</strong>
              <p class="terms-update">最后更新：2026年6月1日 | 生效日期：2026年6月1日</p>
            </div>

            <div class="terms-chapter">
              <h4>第一章 总则</h4>
              <p>1.1 欢迎使用专家平台（以下简称「本平台」）。本平台由专家平台运营方（以下简称「我们」）运营，为用户提供专家咨询信息展示与对接服务。</p>
              <p>1.2 在使用本平台服务前，请您务必审慎阅读、充分理解本条款各条款内容，特别是<strong>免除或限制责任的相应条款、争议解决条款、法律适用条款</strong>。如您对本条款有任何疑问，可通过平台客服渠道进行咨询。</p>
              <p>1.3 <strong>如您点击「同意」按钮或实际使用本平台服务，即视为您已充分理解并同意本条款全部内容，本条款即构成您与我们之间具有法律约束力的协议。</strong>如您不同意本条款的任何条款，请勿注册或使用本平台服务。</p>
            </div>

            <div class="terms-chapter">
              <h4>第二章 服务内容与性质</h4>
              <p>2.1 本平台提供以下服务：</p>
              <ul>
                <li>（一）专家信息展示与查询服务；</li>
                <li>（二）用户与专家之间的咨询预约对接服务；</li>
                <li>（三）任务发布与承接对接服务；</li>
                <li>（四）在线支付与退款处理服务；</li>
                <li>（五）文章发布与知识分享服务。</li>
              </ul>
              <p>2.2 <strong>本平台仅提供信息中介服务，不对专家的专业资质、执业资格、服务质量、咨询效果作任何明示或暗示的保证。</strong></p>
              <p>2.3 本平台不参与用户与专家之间的具体咨询过程，不提供任何形式的专业建议或解决方案，不对咨询内容的准确性、完整性、合法性负责。</p>
            </div>

            <div class="terms-chapter">
              <h4>第三章 用户注册与账户管理</h4>
              <p>3.1 用户分为以下类型：</p>
              <ul>
                <li>（一）个人用户：完成实名认证后可使用咨询预约、任务发布等功能；</li>
                <li>（二）企业用户：需提交企业资质审核，审核通过后可使用企业专属服务；</li>
                <li>（三）入驻专家：需提交专业资质审核，审核通过后可提供咨询服务。</li>
              </ul>
              <p>3.2 用户注册时应提供真实、准确、完整的身份信息，包括但不限于姓名、身份证号、联系方式等。如信息发生变更，应及时更新。</p>
              <p>3.3 用户应妥善保管账户密码，不得出借、转让、出租账户。因账户保管不善导致的损失，由用户自行承担。</p>
              <p>3.4 <strong>平台有权对用户提交的资质材料进行审核，审核通过后方可使用相应功能。审核不通过或发现虚假材料的，平台有权拒绝服务或终止账户。</strong></p>
            </div>

            <div class="terms-chapter">
              <h4>第四章 服务费用与支付</h4>
              <p>4.1 本平台提供的注册、基本信息发布等服务免费。部分增值服务可能收费，具体费用以平台公示为准。</p>
              <p>4.2 咨询服务费用由专家自主定价，平台收取<strong>15%技术服务费</strong>。</p>
              <p>4.3 用户通过平台支付的费用，由平台代收代付。支付成功后，平台将款项划转至专家账户（扣除技术服务费）。</p>
              <p>4.4 <strong>退款规则：</strong></p>
              <ul>
                <li>（一）预约成功但未开始咨询，用户可申请全额退款；</li>
                <li>（二）咨询已开始，原则上不予退款，特殊情况由平台裁定；</li>
                <li>（三）退款将在审核通过后3-7个工作日内原路退回。</li>
              </ul>
            </div>

            <div class="terms-chapter">
              <h4>第五章 用户行为规范</h4>
              <p>5.1 用户在使用本平台服务时，不得从事以下行为：</p>
              <ul>
                <li>（一）发布虚假信息、冒用他人身份；</li>
                <li>（二）发布违法违规内容，包括但不限于赌博、诈骗、洗钱、代开发票、刷单炒信等；</li>
                <li>（三）侮辱、诽谤、骚扰其他用户或专家；</li>
                <li>（四）侵犯他人知识产权、商业秘密、个人隐私；</li>
                <li>（五）利用平台从事违法犯罪活动；</li>
                <li>（六）干扰平台正常运营或破坏平台设施。</li>
              </ul>
              <p>5.2 <strong>用户违反上述规定的，平台有权采取警告、限制功能、暂停服务、终止账户等措施，并保留追究法律责任的权利。</strong></p>
            </div>

            <div class="terms-chapter">
              <h4>第六章 专家入驻与行为规范</h4>
              <p>6.1 专家入驻须提交以下资质材料：</p>
              <ul>
                <li>（一）身份证明（身份证正反面）；</li>
                <li>（二）专业资质证书（如执业证、职称证等，最多5张）；</li>
                <li>（三）紧急联系人信息。</li>
              </ul>
              <p>6.2 专家应确保提供的资质材料真实有效，不得伪造、变造、冒用他人资质。</p>
              <p>6.3 专家发布的信息（包括个人简介、服务内容、文章等）应真实准确，不得夸大宣传、虚假承诺。</p>
              <p>6.4 <strong>专家提供的咨询服务应在其专业资质范围内，不得超出执业范围提供咨询，不得违反行业规范和职业道德。</strong></p>
              <p>6.5 专家发布的文章和观点仅代表其个人立场，不代表本平台观点。平台对文章内容不承担审核责任，但有权对违法违规内容进行删除。</p>
            </div>

            <div class="terms-chapter">
              <h4>第七章 任务发布与承接</h4>
              <p>7.1 任务发布者应确保任务内容合法合规，不得发布以下类型任务：</p>
              <ul>
                <li>（一）涉及赌博、博彩类任务；</li>
                <li>（二）涉及代开发票、虚开发票类任务；</li>
                <li>（三）涉及刷单炒信、虚假交易类任务；</li>
                <li>（四）涉及洗钱、非法集资类任务；</li>
                <li>（五）涉及传销、非法直销类任务；</li>
                <li>（六）涉及枪支、弹药、毒品、违禁品类任务；</li>
                <li>（七）其他违反法律法规的任务。</li>
              </ul>
              <p>7.2 <strong>平台对发布的任务进行审核，审核通过后方可上架。审核通过不代表平台认可任务内容的合法性，发布者应对任务内容承担全部责任。</strong></p>
              <p>7.3 任务承接者应具备相应能力，按时完成任务。任务完成后，发布者应及时验收并支付费用。</p>
              <p>7.4 任务争议由双方协商解决，协商不成的可申请平台介入调解。平台调解结果为最终处理方案。</p>
            </div>

            <div class="terms-chapter">
              <h4>第八章 知识产权</h4>
              <p>8.1 本平台的商标、标识、页面设计、软件程序等知识产权归本平台所有。</p>
              <p>8.2 用户发布的内容（包括咨询记录、任务描述、文章评论等），用户享有著作权，但<strong>用户授权平台在全球范围内永久、免费、可转授权地使用、复制、修改、传播该内容</strong>。</p>
              <p>8.3 用户不得发布侵犯他人知识产权的内容。如因用户发布内容引发知识产权纠纷，由用户自行承担全部责任。</p>
            </div>

            <div class="terms-chapter">
              <h4>第九章 隐私保护</h4>
              <p>9.1 本平台重视用户隐私保护，具体见《隐私政策》。</p>
              <p>9.2 本平台收集的用户信息包括：</p>
              <ul>
                <li>（一）注册信息：姓名、身份证号、手机号、邮箱；</li>
                <li>（二）交易信息：预约记录、支付记录、退款记录；</li>
                <li>（三）行为信息：浏览记录、搜索记录、评价记录。</li>
              </ul>
              <p>9.3 本平台不会向第三方出售用户个人信息。除法律法规要求或经用户同意外，不会向第三方提供用户个人信息。</p>
              <p>9.4 本平台采用行业标准的安全措施保护用户信息，但<strong>不对因不可抗力、黑客攻击等原因导致的信息泄露承担责任</strong>。</p>
            </div>

            <div class="terms-chapter">
              <h4>第十章 免责条款</h4>
              <p>10.1 <strong>本平台不保证服务不中断、不出错，不对因网络故障、系统维护、第三方原因等导致的服务中断或损失承担责任。</strong></p>
              <p>10.2 <strong>用户与专家之间的咨询行为及产生的后果由双方自行负责，本平台不承担任何连带责任。</strong>包括但不限于：</p>
              <ul>
                <li>（一）专家提供的建议导致的用户损失；</li>
                <li>（二）用户未按专家建议操作导致的损失；</li>
                <li>（三）咨询内容的准确性、完整性问题；</li>
                <li>（四）咨询过程中产生的任何争议。</li>
              </ul>
              <p>10.3 <strong>本平台不对专家的专业资质、执业资格、服务质量作任何保证。</strong>用户选择专家时应自行判断，平台不承担推荐或审核责任。</p>
              <p>10.4 本平台不对用户发布的内容承担审核责任，但有权对违法违规内容进行删除、屏蔽，并对违规用户进行处罚。</p>
              <p>10.5 <strong>本平台对用户的最高赔偿责任不超过用户支付的服务费用。</strong></p>
            </div>

            <div class="terms-chapter">
              <h4>第十一章 协议变更与终止</h4>
              <p>11.1 本平台有权随时修改本条款，修改后的条款将在平台公布。如用户继续使用服务，视为同意修改后的条款。</p>
              <p>11.2 如用户不同意修改后的条款，应停止使用本平台服务并注销账户。</p>
              <p>11.3 用户有权随时注销账户，注销后相关数据将按法律法规要求处理。</p>
              <p>11.4 本平台有权在以下情况下终止服务：</p>
              <ul>
                <li>（一）用户违反本条款规定；</li>
                <li>（二）用户提交虚假资质材料；</li>
                <li>（三）用户从事违法活动；</li>
                <li>（四）法律法规要求终止。</li>
              </ul>
            </div>

            <div class="terms-chapter">
              <h4>第十二章 争议解决与法律适用</h4>
              <p>12.1 本条款的订立、履行、解释均适用中华人民共和国法律（不含冲突法）。</p>
              <p>12.2 如发生争议，双方应友好协商解决。协商不成的，任何一方可向平台运营方所在地有管辖权的人民法院提起诉讼。</p>
              <p>12.3 <strong>如本条款任何条款被认定为无效或不可执行，不影响其他条款的效力。</strong></p>
            </div>

            <div class="terms-chapter">
              <h4>第十三章 其他</h4>
              <p>13.1 本条款标题仅为方便阅读，不影响条款含义。</p>
              <p>13.2 本平台未行使本条款下的任何权利，不构成对该权利的放弃。</p>
              <p>13.3 如有任何疑问，可通过以下方式联系我们：</p>
              <ul>
                <li>邮箱：support@expert-platform.com</li>
                <li>在线客服：平台右下角智能客服</li>
              </ul>
              <p class="terms-footer"><strong>请您再次确认已完全理解并同意本条款全部内容后再使用本平台服务。</strong></p>
            </div>
          </div>
        </div>

        <button type="submit" class="reg-btn" id="regBtn">注册</button>
        <div class="reg-switch">已有账号？<a href="#" onclick="navigate('login');return false">立即登录</a></div>
      </form>
    </div>
  `;
  window._regRole = 'personal';
}

function selectRole(role) {
  window._regRole = role;
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('active'));
  document.querySelector(`.role-card[data-role="${role}"]`).classList.add('active');
  document.getElementById('companyFields').style.display = role === 'company' ? 'block' : 'none';
  document.getElementById('expertFields').style.display = role === 'expert' ? 'block' : 'none';
}

function previewUpload(input, previewId) {
  const el = document.getElementById(previewId);
  if (input.files[0]) {
    el.innerHTML = '<img src="' + URL.createObjectURL(input.files[0]) + '" style="max-width:100%;max-height:120px;object-fit:contain;border-radius:8px;">';
  }
}

function previewMultiUpload(input, previewId) {
  const el = document.getElementById(previewId);
  el.innerHTML = '';
  Array.from(input.files).forEach(f => {
    el.innerHTML += '<img src="' + URL.createObjectURL(f) + '" style="max-width:100px;max-height:80px;object-fit:contain;border-radius:6px;margin:4px;">';
  });
}

function handleRegister(e) {
  e.preventDefault();
  
  // 检查免责声明勾选
  const agreeCheckbox = document.getElementById('regAgree');
  if (!agreeCheckbox.checked) {
    alert('请先阅读并同意《服务条款与免责声明》');
    return;
  }
  
  const form = document.getElementById('registerForm');
  const btn = document.getElementById('regBtn');
  btn.disabled = true;
  btn.textContent = '注册中...';
  
  const formData = new FormData(form);
  const role = window._regRole;
  
  fetch(API + '/register/' + role, { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        alert(data.message);
        navigate('login');
      } else {
        alert(data.error || '注册失败');
      }
    })
    .catch(err => alert('网络错误'))
    .finally(() => { btn.disabled = false; btn.textContent = '注册'; });
}

function showRegDisclaimer() {
  const el = document.getElementById('regDisclaimerText');
  if (el) {
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
    if (el.style.display === 'block') el.scrollIntoView({ behavior: 'smooth' });
  }
}

// ========== 任务发布模块 ==========
function renderTaskPublish() {
  const app = document.getElementById('app');
  if (!currentUser) { app.innerHTML = '<p>请先 <a href="#" onclick="navigate(\'login\');return false">登录</a></p>'; return; }
  
  app.innerHTML = `
    <div class="task-publish">
      <h2>📝 发布任务</h2>
      <p class="task-notice">⚠️ 发布的任务将经过管理员审核，请确保内容合法合规，不违反国家法律法规和行业规范。</p>
      <form onsubmit="handleTaskPublish(event)">
        <div class="form-group">
          <label>任务标题 <span class="req">*</span></label>
          <input name="title" placeholder="简要描述任务需求" required maxlength="100">
        </div>
        <div class="form-group">
          <label>任务分类</label>
          <select name="category">
            <option value="">请选择</option>
            <option>心理咨询</option><option>法律咨询</option><option>职业规划</option>
            <option>财税顾问</option><option>教育辅导</option><option>IT技术</option>
            <option>设计创意</option><option>文案策划</option><option>翻译服务</option>
            <option>其他</option>
          </select>
        </div>
        <div class="form-group">
          <label>任务描述 <span class="req">*</span></label>
          <textarea name="description" placeholder="详细描述您的需求、期望成果等" required rows="6"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>最低预算 (¥)</label>
            <input name="budget_min" type="number" min="0" placeholder="0">
          </div>
          <div class="form-group">
            <label>最高预算 (¥)</label>
            <input name="budget_max" type="number" min="0" placeholder="0">
          </div>
        </div>
        <div class="form-group">
          <label>截止日期</label>
          <input name="deadline" type="date">
        </div>
        <div class="form-group">
          <label>技能要求</label>
          <textarea name="requirements" placeholder="对承接者的资质、经验要求等" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>附件（最多5个）</label>
          <div class="upload-box" onclick="document.getElementById('taskFiles').click()">
            <input type="file" id="taskFiles" name="attachments" multiple hidden onchange="previewMultiUpload(this,'taskFiles_preview')">
            <div id="taskFiles_preview" class="upload-placeholder">📎 点击上传附件</div>
          </div>
        </div>
        <button type="submit" class="reg-btn" id="taskBtn">提交审核</button>
      </form>
    </div>
  `;
}

function handleTaskPublish(e) {
  e.preventDefault();
  const btn = document.getElementById('taskBtn');
  btn.disabled = true; btn.textContent = '提交中...';
  
  const formData = new FormData(e.target);
  fetch(API + '/tasks', { method: 'POST', body: formData, headers: authHeaders() })
    .then(r => r.json())
    .then(data => {
      alert(data.message);
      if (data.success && data.task_id) navigate('task/' + data.task_id);
      else navigate('tasks');
    })
    .catch(() => alert('网络错误'))
    .finally(() => { btn.disabled = false; btn.textContent = '提交审核'; });
}

// ========== 任务列表页 ==========
function renderTaskList() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="task-list-page">
      <h2>📋 任务大厅</h2>
      <div class="task-filters">
        <input id="taskSearch" placeholder="搜索任务..." style="flex:1;padding:10px 14px;border:1px solid #ddd;border-radius:8px;">
        <select id="taskCatFilter" onchange="loadTasks(1)" style="padding:10px;border:1px solid #ddd;border-radius:8px;">
          <option value="">全部分类</option>
          <option>心理咨询</option><option>法律咨询</option><option>职业规划</option>
          <option>财税顾问</option><option>IT技术</option><option>设计创意</option><option>其他</option>
        </select>
      </div>
      <div id="taskListContainer"></div>
      <div id="taskPagination" class="pagination"></div>
    </div>
  `;
  loadTasks(1);
}

function loadTasks(page) {
  const keyword = document.getElementById('taskSearch')?.value || '';
  const category = document.getElementById('taskCatFilter')?.value || '';
  fetch(`${API}/tasks?page=${page}&keyword=${encodeURIComponent(keyword)}&category=${encodeURIComponent(category)}`)
    .then(r => r.json())
    .then(data => {
      const container = document.getElementById('taskListContainer');
      if (!data.tasks.length) { container.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">暂无任务</p>'; return; }
      container.innerHTML = data.tasks.map(t => `
        <div class="task-card" onclick="navigate('task/${t.id}')">
          <div class="tc-title">${escHtml(t.title)}</div>
          <div class="tc-meta">
            <span class="tc-cat">${escHtml(t.category || '未分类')}</span>
            <span>👤 ${escHtml(t.publisher_name || '匿名')}</span>
            <span>👁 ${t.view_count || 0}</span>
            <span>👥 ${t.applicant_count || 0}人申请</span>
          </div>
          <div class="tc-desc">${escHtml((t.description || '').substring(0, 100))}${(t.description||'').length > 100 ? '...' : ''}</div>
          <div class="tc-budget">${t.budget_min || 0}${t.budget_max > t.budget_min ? ' - ¥' + t.budget_max : ''} 元</div>
        </div>
      `).join('');
      
      // 分页
      const pag = document.getElementById('taskPagination');
      if (data.totalPages > 1) {
        let html = '';
        if (data.page > 1) html += `<button onclick="loadTasks(${data.page-1})">上一页</button>`;
        html += `<span>第 ${data.page}/${data.totalPages} 页</span>`;
        if (data.page < data.totalPages) html += `<button onclick="loadTasks(${data.page+1})">下一页</button>`;
        pag.innerHTML = html;
      }
    })
    .catch(() => {});
}

// ========== 任务详情页 ==========
function renderTaskDetail(taskId) {
  const app = document.getElementById('app');
  fetch(`${API}/tasks/${taskId}`)
    .then(r => r.json())
    .then(task => {
      if (!task || !task.id) { app.innerHTML = '<p>任务不存在</p>'; return; }
      app.innerHTML = `
        <div class="task-detail">
          <h2>${escHtml(task.title)}</h2>
          <div class="td-meta">
            <span class="td-cat">${escHtml(task.category || '未分类')}</span>
            <span>👤 ${escHtml(task.publisher_name)}</span>
            <span>📅 ${task.created_at ? task.created_at.split('T')[0] : ''}</span>
            <span>👁 ${task.view_count}</span>
            <span>👥 ${task.applicant_count}人申请</span>
          </div>
          <div class="td-budget">💰 预算：¥${task.budget_min || 0}${task.budget_max > task.budget_min ? ' - ¥' + task.budget_max : ''}</div>
          ${task.deadline ? '<div class="td-deadline">⏰ 截止：' + escHtml(task.deadline) + '</div>' : ''}
          <div class="td-section">
            <h3>任务描述</h3>
            <p>${escHtml(task.description)}</p>
          </div>
          ${task.requirements ? '<div class="td-section"><h3>技能要求</h3><p>' + escHtml(task.requirements) + '</p></div>' : ''}
          ${task.attachments ? '<div class="td-section"><h3>附件</h3>' + task.attachments.split(',').map(a => '<a href="' + a + '" target="_blank" class="td-attach">📎 ' + a.split('/').pop() + '</a>').join('') + '</div>' : ''}
          <div style="margin-top:24px;text-align:center;">
            ${currentUser && task.publisher_id !== currentUser.id ? '<button class="reg-btn" onclick="navigate(\'task-apply/' + task.id + '\')">申请此任务</button>' : ''}
            <button class="btn-outline" onclick="navigate('tasks')" style="margin-left:8px;">返回任务列表</button>
          </div>
        </div>
      `;
    })
    .catch(() => { app.innerHTML = '<p>加载失败</p>'; });
}

// ========== 任务申请页 ==========
function renderTaskApply(taskId) {
  const app = document.getElementById('app');
  if (!currentUser) { app.innerHTML = '<p>请先 <a href="#" onclick="navigate(\'login\');return false">登录</a></p>'; return; }
  
  app.innerHTML = `
    <div class="task-apply-page">
      <h2>📝 申请任务 #${taskId}</h2>
      <form onsubmit="handleTaskApply(event, ${taskId})">
        <div class="form-group">
          <label>方案描述</label>
          <textarea name="proposal" placeholder="描述您的能力、方案思路、预计完成时间等" rows="6"></textarea>
        </div>
        <div class="form-group">
          <label>报价 (¥)</label>
          <input name="proposed_budget" type="number" min="0" placeholder="您的报价">
        </div>
        <button type="submit" class="reg-btn" id="applyBtn">提交申请</button>
      </form>
    </div>
  `;
}

function handleTaskApply(e, taskId) {
  e.preventDefault();
  const btn = document.getElementById('applyBtn');
  btn.disabled = true; btn.textContent = '提交中...';
  
  fetch(API + '/tasks/' + taskId + '/apply', {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      proposal: e.target.proposal.value,
      proposed_budget: parseFloat(e.target.proposed_budget.value) || 0
    })
  })
    .then(r => r.json())
    .then(data => {
      alert(data.message || (data.success ? '申请成功' : '申请失败'));
      if (data.success) navigate('tasks');
    })
    .catch(() => alert('网络错误'))
    .finally(() => { btn.disabled = false; btn.textContent = '提交申请'; });
}

// ========== 我的任务 ==========
function renderMyTasks() {
  const app = document.getElementById('app');
  if (!currentUser) { app.innerHTML = '<p>请先 <a href="#" onclick="navigate(\'login\');return false">登录</a></p>'; return; }
  
  fetch(API + '/my/tasks', { headers: authHeaders() })
    .then(r => r.json())
    .then(tasks => {
      const statusMap = { pending_review: '⏳ 待审核', published: '✅ 已发布', paused: '⏸️ 已暂停', completed: '🎉 已完成', rejected: '❌ 已拒绝', cancelled: '🚫 已取消' };
      app.innerHTML = `
        <div class="my-tasks">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h2>我的任务</h2>
            <button class="reg-btn" onclick="navigate('task-publish')" style="font-size:14px;padding:8px 16px;">+ 发布新任务</button>
          </div>
          ${tasks.length === 0 ? '<p style="text-align:center;color:#999;padding:40px;">暂无任务</p>' : ''}
          ${tasks.map(t => `
            <div class="task-card" onclick="navigate('task/${t.id}')">
              <div class="tc-title">${escHtml(t.title)}</div>
              <div class="tc-meta">
                <span>${statusMap[t.status] || t.status}</span>
                <span>👥 ${t.applicant_count || 0}人申请</span>
                <span>👁 ${t.view_count || 0}</span>
              </div>
              ${t.reject_reason ? '<div style="color:#e74c3c;font-size:13px;margin-top:4px;">拒绝原因：' + escHtml(t.reject_reason) + '</div>' : ''}
            </div>
          `).join('')}
        </div>
      `;
    })
    .catch(() => {});
}
