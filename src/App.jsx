import { cloneElement, useEffect, useMemo, useRef, useState } from 'react';

const navItems = [
  ['tasks', '01', '待办事项', 'TASKS'],
  ['board', '02', '进度看板', 'BOARD'],
  ['literature', '03', '文献中心', 'ARCHIVE'],
  ['projects', '04', '项目管理', 'PROJECT'],
  ['inspirations', '05', '创作灵感', 'IDEAS'],
  ['reports', '06', '日报 / 周报', 'REPORT'],
  ['github', '07', 'GitHub 热点', 'SIGNAL'],
  ['time', '08', '时间规划', 'TIMER'],
  ['dailyPlan', '09', '每日计划', 'SCHEDULE'],
  ['fitness', '10', '运动健身', 'FITNESS'],
  ['settings', '11', '设置', 'SYSTEM']
];

const lightPages = new Set(['tasks', 'literature', 'inspirations', 'reports', 'github', 'settings', 'time', 'dailyPlan', 'fitness']);

const tasks = [
  {
    id: 't1',
    title: '完成实验设计与变量表整理',
    priority: 'high',
    status: 'doing',
    due: 'DUE 8月12日 周三',
    project: '论文复现',
    note: '把数据采集、评价指标和消融实验拆成可执行步骤。',
    steps: ['确认数据集版本', '补齐 baseline 参数', '输出实验记录模板']
  },
  {
    id: 't2',
    title: '阅读多模态检索综述并归档摘要',
    priority: 'medium',
    status: 'todo',
    due: 'DUE 8月14日 周五',
    project: '文献调研',
    note: '重点记录模型结构、检索指标和可复现代码。'
  },
  {
    id: 't3',
    title: '提交本周导师沟通纪要',
    priority: 'low',
    status: 'done',
    due: 'DUE 8月10日 周一',
    project: '周报',
    note: '已同步实验风险和下一步计划。'
  }
];

const literature = [
  ['Contrastive Language-Image Pretraining Review', 'Radford et al. · 2021 · CLIP, 多模态'],
  ['Retrieval-Augmented Generation for Research Workflows', 'Lewis et al. · 2020 · RAG, Agent'],
  ['A Survey on Scientific Literature Mining', 'Zhang et al. · 2024 · 文献挖掘']
];

const projects = [
  ['grad-research-workbench', 'D:/code/grad-research-workbench', '本地科研工作台，包含任务、文献、报告与 Agent 助手。'],
  ['paper-reproduction', 'D:/research/paper-reproduction', '实验复现项目，包含训练脚本、评估结果和论文草稿。'],
  ['weekly-reports', 'D:/research/reports', '日报、周报与会议纪要归档。']
];

function todayLabel() {
  const d = new Date();
  const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 · 周${week}`;
}

function rarity(priority) {
  const count = { high: 6, medium: 4, low: 2 }[priority] || 2;
  return Array.from({ length: count }, (_, i) => <i key={i} />);
}

function priorityLabel(priority) {
  return { high: '高', medium: '中', low: '低' }[priority] || '中';
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = (message, type = 'info') => {
    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 2600);
  };
  return [toasts, push];
}

function BootSequence() {
  const [visible, setVisible] = useState(true);
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const fill = root.querySelector('#bootLoaderFill');
    const value = root.querySelector('#bootLoaderValue');
    const number = value && value.querySelector('b');
    const loader = root.querySelector('.boot-loader-track');
    const projectLogo = root.querySelector('.boot-project-logo');
    const endfieldLogo = root.querySelector('.boot-endfield-logo');
    const divider = root.querySelector('.boot-logo-divider');
    const contours = root.querySelector('.boot-contours');
    const status = root.querySelector('#bootStatusCopy');
    const wipe = root.querySelector('#bootYellowWipe');
    const animations = [];
    let rafId = 0;
    let cancelled = false;

    const pause = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
    const animate = (element, keyframes, options) => {
      if (!element || !element.animate) return { finished: Promise.resolve(), cancel() {} };
      const animation = element.animate(keyframes, options);
      animations.push(animation);
      return animation;
    };
    const driveCounter = ({ delay, duration }) => new Promise((resolve) => {
      const started = performance.now() + delay;
      let last = -1;
      const tick = (now) => {
        if (cancelled) return;
        const raw = Math.max(0, Math.min(1, (now - started) / duration));
        const eased = 1 - Math.pow(1 - raw, 3.25);
        const percent = Math.min(100, Math.round(eased * 100));
        if (percent !== last) {
          last = percent;
          number.textContent = String(percent).padStart(3, '0');
          const markerHeight = value.offsetHeight || 43;
          const maxY = Math.max(0, loader.clientHeight - markerHeight);
          const markerY = Math.max(0, Math.min(maxY, (loader.clientHeight * eased) - (markerHeight / 2)));
          value.style.transform = `translate3d(0,${markerY}px,0)`;
          if (percent >= 72) status.innerHTML = '<span>VERIFYING</span><b>校验本地服务与工作模块</b>';
          else if (percent >= 34) status.innerHTML = '<span>LOADING</span><b>载入研究数据与视觉系统</b>';
        }
        if (raw < 1) rafId = requestAnimationFrame(tick);
        else resolve();
      };
      rafId = requestAnimationFrame(tick);
    });

    async function runBootSequence() {
      if (!fill || !value || !number || !loader || !wipe || !status) {
        setVisible(false);
        return;
      }

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const loadDelay = reduced ? 40 : 90;
      const loadDuration = reduced ? 420 : 1450;
      document.body.classList.add('booting');

      try {
        animate(projectLogo, [
          { transform: 'translate3d(38px,0,0) scale(.96)', opacity: 0 },
          { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 }
        ], { duration: reduced ? 180 : 720, delay: reduced ? 0 : 140, easing: 'cubic-bezier(.16,.78,.18,1)', fill: 'both' });
        animate(endfieldLogo, [
          { transform: 'translate3d(28px,0,0)', opacity: 0 },
          { transform: 'translate3d(0,0,0)', opacity: 1 }
        ], { duration: reduced ? 180 : 680, delay: reduced ? 0 : 310, easing: 'cubic-bezier(.18,.76,.2,1)', fill: 'both' });
        animate(divider, [
          { transform: 'scaleY(.15)', opacity: 0 },
          { transform: 'scaleY(1)', opacity: .7 }
        ], { duration: reduced ? 150 : 620, delay: reduced ? 0 : 460, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' });
        animate(contours, [
          { transform: 'translate3d(12px,-8px,0) scale(1.025)', opacity: .32 },
          { transform: 'translate3d(0,0,0) scale(1)', opacity: .72 }
        ], { duration: loadDuration + loadDelay, easing: 'cubic-bezier(.2,.65,.2,1)', fill: 'both' });

        const fillAnimation = animate(fill, [
          { transform: 'scaleY(0)' },
          { transform: 'scaleY(1)' }
        ], { duration: loadDuration, delay: loadDelay, easing: 'cubic-bezier(.26,.02,.18,1)', fill: 'both' });

        await driveCounter({ delay: loadDelay, duration: loadDuration });
        await fillAnimation.finished;
        if (cancelled) return;
        number.textContent = '100';
        status.innerHTML = '<span>READY</span><b>工作台加载完成</b>';

        await pause(reduced ? 35 : 90);
        const wipeIn = animate(wipe, [
          { transform: 'scaleX(0)' },
          { transform: 'scaleX(1)' }
        ], { duration: reduced ? 250 : 720, easing: 'cubic-bezier(.72,0,.18,1)', fill: 'both' });
        await wipeIn.finished;
        if (cancelled) return;

        root.classList.add('reveal-ready');
        root.style.background = 'transparent';
        const wipeOut = animate(wipe, [
          { transform: 'scaleX(1)', opacity: 1 },
          { transform: 'scaleX(1)', opacity: 0 }
        ], { duration: reduced ? 200 : 760, delay: reduced ? 20 : 110, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both' });
        await wipeOut.finished;
      } finally {
        if (!cancelled) {
          document.body.classList.remove('booting');
          setVisible(false);
        }
      }
    }

    runBootSequence();
    const fallback = window.setTimeout(() => {
      document.body.classList.remove('booting');
      setVisible(false);
    }, 5000);

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      if (rafId) cancelAnimationFrame(rafId);
      animations.forEach((animation) => animation.cancel());
      document.body.classList.remove('booting');
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="boot-sequence" id="bootSequence" ref={rootRef} role="status" aria-label="科研工作台正在加载">
      <div className="boot-material" aria-hidden="true" />
      <div className="boot-contours" aria-hidden="true"><i /><i /><i /></div>
      <div className="boot-index" aria-hidden="true">WB / STARTUP PROCEDURE<br />LOCAL RESEARCH OPERATIONS</div>
      <div className="boot-loader">
        <div className="boot-loader-track"><i id="bootLoaderFill" /></div>
        <div className="boot-loader-value" id="bootLoaderValue"><b>000</b><span>%</span></div>
      </div>
      <div className="boot-identity">
        <div className="boot-project-logo">
          <img src="/assets/brand/research-workbench-logo-v1.png" alt="科研工作台" />
          <span>RESEARCH WORKBENCH / LOCAL CORE</span>
        </div>
        <div className="boot-logo-divider"><i /><span>×</span><i /></div>
        <div className="boot-endfield-logo">
          <img src="/assets/official/blurred_logo.eccbe4f3.png" alt="终末地" />
          <div><strong>终末地</strong><span>ARKNIGHTS: ENDFIELD</span></div>
        </div>
      </div>
      <div className="boot-status-copy" id="bootStatusCopy"><span>INITIALIZING</span><b>系统资源载入中</b></div>
      <div className="boot-yellow-wipe" id="bootYellowWipe" aria-hidden="true" />
    </div>
  );
}

function ChartCard({ title, type, wide = false, tall = false }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!window.echarts || !ref.current) return undefined;
    const chart = window.echarts.init(ref.current, null, { renderer: 'canvas' });
    const yellow = '#fff44f';
    const ink = '#111418';
    const common = {
      animationDuration: 650,
      textStyle: { fontFamily: 'Space Grotesk, HarmonyOS Sans SC, sans-serif', color: ink }
    };
    const options = {
      done: {
        ...common,
        series: [{ type: 'pie', radius: ['58%', '82%'], avoidLabelOverlap: false, data: [{ value: 67, name: '完成' }, { value: 33, name: '剩余' }], color: [yellow, '#20242a'], label: { formatter: '{d}%', color: ink, fontWeight: 700 } }]
      },
      priority: {
        ...common,
        grid: { left: 32, right: 14, top: 18, bottom: 22 },
        xAxis: { type: 'category', data: ['高', '中', '低'] },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: '#d8d8d3' } } },
        series: [{ type: 'bar', data: [5, 9, 3], itemStyle: { color: yellow, borderColor: '#111', borderWidth: 1 } }]
      },
      trend: {
        ...common,
        grid: { left: 32, right: 16, top: 18, bottom: 24 },
        xAxis: { type: 'category', data: ['周二', '周三', '周四', '周五', '周六', '周日', '周一'] },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: '#d8d8d3' } } },
        series: [{ type: 'line', smooth: true, symbol: 'circle', symbolSize: 8, data: [2, 4, 3, 6, 5, 7, 8], areaStyle: { color: 'rgba(255,244,79,.28)' }, lineStyle: { color: '#111', width: 3 }, itemStyle: { color: yellow, borderColor: '#111' } }]
      },
      daily: {
        ...common,
        tooltip: {},
        radar: { indicator: [{ name: '专注', max: 8 }, { name: '阅读', max: 8 }, { name: '写作', max: 8 }, { name: '实验', max: 8 }, { name: '休息', max: 8 }], splitArea: { areaStyle: { color: ['#fff', '#efefec'] } } },
        series: [{ type: 'radar', data: [{ value: [6, 4, 3, 7, 2], name: '今日' }], lineStyle: { color: '#111' }, areaStyle: { color: 'rgba(255,244,79,.45)' }, itemStyle: { color: yellow } }]
      },
      weekly: {
        ...common,
        grid: { left: 32, right: 12, top: 18, bottom: 24 },
        xAxis: { type: 'category', data: ['一', '二', '三', '四', '五', '六', '日'] },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: '#d8d8d3' } } },
        series: [{ type: 'bar', stack: 'total', data: [3, 4, 5, 3, 6, 2, 1], itemStyle: { color: '#111418' } }, { type: 'bar', stack: 'total', data: [2, 2, 1, 3, 2, 4, 3], itemStyle: { color: yellow } }]
      },
      project: {
        ...common,
        series: [{ type: 'graph', layout: 'force', roam: false, force: { repulsion: 120, edgeLength: 70 }, label: { show: true, color: ink }, data: ['main', 'renderer', 'store', 'ai', 'report'].map((name, index) => ({ name, symbolSize: index ? 38 : 60, itemStyle: { color: index ? '#f3f3f0' : yellow, borderColor: '#111', borderWidth: 2 } })), links: [{ source: 'main', target: 'store' }, { source: 'main', target: 'ai' }, { source: 'renderer', target: 'main' }, { source: 'report', target: 'store' }] }]
      }
    };
    chart.setOption(options[type] || options.trend);
    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      chart.dispose();
    };
  }, [type]);

  return (
    <div className={`chart-card ${wide ? 'wide' : ''}`}>
      <div className="chart-title">{title}</div>
      <div ref={ref} className={`chart ${tall ? 'tall' : ''}`} />
    </div>
  );
}

function Sidebar({ activePage, collapsed, onNavigate, onToggle, onAssistant, onTasks }) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} id="sidebar">
      <div className="brand">
        <img className="brand-mark" src="/assets/brand/research-workbench-logo-cropped-v1.png" alt="科研工作台" />
        <span className="brand-code" aria-hidden="true">RW / 01</span>
        <button className="sidebar-toggle" aria-label="展开 / 收起侧边栏" title="展开 / 收起侧边栏" onClick={onToggle}><span /></button>
      </div>
      <nav className="nav" id="nav">
        {navItems.map(([key, code, label, en]) => (
          <a
            className={`nav-item ${activePage === key ? 'active hologram' : ''}`}
            data-page={key}
            href="#"
            key={key}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(key);
            }}
          >
            <span className="nav-ico">{code}</span><span>{label}</span><small>{en}</small>
          </a>
        ))}
      </nav>
      <div className="sidebar-foot">
        <section className="agent-task-card running" aria-live="polite" role="button" tabIndex="0" aria-label="打开任务中心" onClick={onTasks}>
          <div className="agent-task-head"><span>AGENT QUEUE</span><b>3</b></div>
          <strong>后台任务同步中</strong>
          <small>摘要、扫描与同步进度会显示在这里</small>
          <div className="agent-task-progress"><i style={{ width: '68%' }} /></div>
        </section>
        <button className="assistant-square" aria-label="打开智能助理" onClick={onAssistant}>
          <span className="assistant-square-grid" aria-hidden="true" />
          <span className="assistant-square-orbit" aria-hidden="true" />
          <img className="assistant-square-avatar" src="/assets/ui/2_13-20260805_121014555.png" alt="" />
          <span className="assistant-square-copy"><strong>智能助理</strong><small>AI WORKMATE</small></span>
          <span className="ai-status on" title="AI 状态" />
        </button>
      </div>
    </aside>
  );
}

function PageHead({ title, sub, children }) {
  return (
    <header className="page-head">
      <div>
        <h1>{title}</h1>
        <p className="page-sub">{sub}</p>
      </div>
      {children ? <div className="head-actions">{children}</div> : null}
    </header>
  );
}

function StatStrip({ stats }) {
  return (
    <div className="stat-strip">
      {stats.map((item) => (
        <div className="stat-card" key={item.label}>
          <div className="lbl">{item.label}</div>
          <div className={`num ${item.tone || ''}`}>{item.value}{item.unit ? <small style={{ fontSize: 14 }}> {item.unit}</small> : null}</div>
        </div>
      ))}
    </div>
  );
}

function TasksPage({ className = 'page active', onOpenModal, onToast }) {
  const [filter, setFilter] = useState('all');
  const visibleTasks = tasks.filter((task) => filter === 'all' || filter === task.status || filter === task.priority);
  return (
    <section className={className} id="page-tasks">
      <PageHead title="待办事项" sub={todayLabel()}>
        <input className="input ai-add-input" placeholder="用自然语言快速添加任务，例如：明天下午3点完成实验设计（高优先级）" />
        <button className="btn btn-primary" onClick={() => onToast('已识别为高优先级任务草稿', 'ok')}>AI 添加</button>
        <button className="btn" onClick={() => onOpenModal('task')}>＋ 新建任务</button>
      </PageHead>
      <StatStrip stats={[{ label: '今日完成', value: 1, tone: 'hl-green' }, { label: '进行中', value: 1, tone: 'hl-blue' }, { label: '已逾期', value: 0, tone: 'hl-red' }, { label: '任务总数', value: 3 }]} />
      <div className="filter-bar">
        <div className="seg">
          {['all', 'today', 'overdue', 'high', 'done'].map((key) => (
            <button className={`seg-btn ${filter === key ? 'active' : ''}`} key={key} onClick={() => setFilter(key)}>
              {{ all: '全部', today: '今天', overdue: '已逾期', high: '高优先级', done: '已完成' }[key]}
            </button>
          ))}
        </div>
      </div>
      <div className="task-list">
        {visibleTasks.map((task) => (
          <div className={`task-item priority-${task.priority} ${task.status === 'done' ? 'done' : ''}`} key={task.id}>
            <div className="t-check" title="标记完成">✓</div>
            <div className="t-main">
              <div className="t-title">{task.title}</div>
              <div className="t-meta">
                <span className={`tag ${task.priority}`}>{priorityLabel(task.priority)}优先级</span>
                <span className="rarity-stars" title="优先级">{rarity(task.priority)}</span>
                <span className="tag">{task.due}</span>
                <span className="tag project">PROJECT {task.project}</span>
                <span className="tag status">{task.status === 'todo' ? '待办' : task.status === 'doing' ? '进行中' : '已完成'}</span>
              </div>
              <div className="t-note muted">{task.note}</div>
              {task.steps ? <ul className="t-subs">{task.steps.map((step, index) => <li key={step}><span>{index + 1}. {step}</span></li>)}</ul> : null}
            </div>
            <div className="t-actions">
              <button className="icon-btn plan-btn" onClick={() => onOpenModal('split')}>PLAN</button>
              <button className="icon-btn">EDIT</button>
              <button className="icon-btn">DEL</button>
            </div>
          </div>
        ))}
      </div>
      <aside className="task-side-rail" aria-hidden="true">
        <span className="task-side-title">TODAY PLAN</span>
        <span className="task-side-strip" />
        <small>DAILY WORKFLOW<br />RESEARCH OPERATIONS</small>
      </aside>
    </section>
  );
}

function BoardPage({ className = 'page active' }) {
  return (
    <section className={className} id="page-board">
      <PageHead title="工作进度看板" sub="任务完成率 · 时间分配 · 趋势统计">
        <button className="btn">↻ 刷新统计</button>
      </PageHead>
      <div className="board-stats">
        <ChartCard title="任务完成率" type="done" />
        <ChartCard title="任务优先级分布" type="priority" />
        <ChartCard title="近 7 天动态" type="trend" wide />
      </div>
      <div className="kanban">
        {[
          ['todo', '待办', tasks.filter((task) => task.status === 'todo')],
          ['doing', '进行中', tasks.filter((task) => task.status === 'doing')],
          ['done', '已完成', tasks.filter((task) => task.status === 'done')]
        ].map(([status, label, items]) => (
          <div className="kanban-col" data-status={status} key={status}>
            <div className={`kanban-head ${status}`}>{label} <span className="count">{items.length}</span></div>
            <div className="kanban-body">
              {items.map((task) => (
                <div className={`kan-card priority-${task.priority}`} key={task.id}>
                  <div className="k-title">{task.title}</div>
                  <div className="k-meta"><span className={`tag ${task.priority}`}>{priorityLabel(task.priority)}</span><span className="due">{task.due}</span></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LiteraturePage({ className = 'page active', onOpenModal }) {
  const [graph, setGraph] = useState(false);
  return (
    <section className={className} id="page-literature">
      <PageHead title="文献中心" sub="每日文献总结 · 结构化摘要 · 笔记归档 · 分类图谱">
        <button className="btn" onClick={() => setGraph(true)}>关联图谱</button>
        <button className="btn">导入 PDF</button>
        <button className="btn btn-primary" onClick={() => onOpenModal('literature')}>＋ 添加文献</button>
      </PageHead>
      {!graph ? (
        <div className="split lit-split3">
          <div className="lit-col lit-col-tree" data-col="tree">
            <div className="col-tree-head"><span>分类</span><span className="lit-col-ops"><button className="btn btn-xs" onClick={() => onOpenModal('litCollection')}>＋ 新建</button><button className="lit-collapse-btn">◀</button></span></div>
            <div className="tree">
              <div className="tree-node active">全部文献 <b>12</b></div>
              <div className="tree-node">深度学习 <b>5</b></div>
              <div className="tree-node">综述论文 <b>4</b></div>
              <div className="tree-node">复现实验 <b>3</b></div>
            </div>
          </div>
          <div className="lit-divider" />
          <div className="lit-col split-left" data-col="list">
            <div className="lit-list-head"><span className="lit-col-title">文献列表</span><button className="lit-collapse-btn">◀</button></div>
            <div className="row lit-bulk-bar"><label className="check"><input type="checkbox" /> 全选</label><span className="muted">已选 0</span><span style={{ flex: 1 }} /><button className="btn btn-sm" onClick={() => onOpenModal('litAssign')}>移至分类</button></div>
            <input className="input" placeholder="搜索标题 / 作者 / 标签" />
            <div className="lit-list">
              {literature.map(([title, meta], index) => (
                <div className={`lit-item ${index === 0 ? 'active' : ''}`} key={title}>
                  <input className="lit-check" type="checkbox" />
                  <div className="lit-item-body">
                    <div className="l-title">{title}</div>
                    <div className="l-meta">{meta}</div>
                    <div className="lit-tags"><span className="tag medium">AI</span><span className="tag low">NOTE</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lit-divider" />
          <div className="lit-col split-right" data-col="detail">
            <div className="lit-detail-head"><span className="lit-col-title">详情</span><button className="lit-collapse-btn">◀</button></div>
            <div className="lit-detail">
              <h2>Contrastive Language-Image Pretraining Review</h2>
              <div className="ld-meta">Radford et al. · 2021 · CLIP / 多模态 / 表征学习</div>
              <div className="ld-actions"><button className="btn">AI 生成摘要</button><button className="btn">编辑笔记</button><button className="btn">删除</button></div>
              <div className="summary-box markdown">
                <h2>结构化摘要</h2>
                <p>这篇文献适合作为多模态检索方向的基础材料，核心价值在于大规模对比学习和零样本迁移。</p>
                <h3>可复现要点</h3>
                <ul><li>记录数据来源与预处理。</li><li>对比不同文本编码器设置。</li><li>输出检索指标表。</li></ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="lit-graph-view">
          <div className="lit-graph-head">
            <div className="chart-title">文献关联图谱</div>
            <div className="row"><select className="input gh-since"><option>全部文献</option></select><button className="btn btn-primary">AI 生成关系</button><button className="btn" onClick={() => setGraph(false)}>← 返回列表</button></div>
          </div>
          <div className="lit-graph-wrap">
            <div className="lit-graph-canvas"><ChartCard title="关系网络" type="project" tall /></div>
            <div className="lit-graph-side">{literature.map(([title]) => <div className="g-node" key={title}><b>{title}</b><div className="g-reason">与 RAG、实验复现和摘要生成工作流存在引用或方法关系。</div></div>)}</div>
          </div>
        </div>
      )}
    </section>
  );
}

function ProjectsPage({ className = 'page active' }) {
  const [active, setActive] = useState(0);
  return (
    <section className={className} id="page-projects">
      <PageHead title="项目管理" sub="打开本地项目文件夹 · 可视化项目结构关系图谱">
        <button className="btn btn-primary">＋ 添加项目</button>
      </PageHead>
      <div className="project-cards">
        {projects.map(([name, path, desc], index) => (
          <div className={`project-card ${active === index ? 'active' : ''}`} key={name} onClick={() => setActive(index)}>
            <div className="p-name">{name}</div>
            <div className="p-path">{path}</div>
            <div className="p-desc">{desc}</div>
            <div className="p-meta"><span className="tag">LOCAL</span><span className="tag medium">SCAN READY</span></div>
          </div>
        ))}
      </div>
      <div className="project-detail">
        <div className="detail-head">
          <h2>{projects[active][0]}</h2>
          <span className="muted">{projects[active][1]}</span>
          <div className="detail-actions"><button className="btn">↻ 重新扫描</button><button className="btn btn-danger">删除项目</button></div>
        </div>
        <div className="project-grid">
          <div className="graph-panel"><ChartCard title="项目结构关系图谱" type="project" tall /></div>
          <div className="tree-panel">
            <div className="chart-title">目录结构</div>
            <div className="tree">
              {['main/index.js', 'renderer/index.html', 'renderer/js/app.js', 'renderer/css/theme.css', 'preload.js'].map((item) => <div className="tree-node" key={item}>{item}</div>)}
            </div>
            <div className="file-preview">选择文件后显示代码预览、依赖关系和摘要。</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InspirationsPage({ className = 'page active' }) {
  const ideas = ['把任务拆解做成可审核计划流', '文献卡片加入引用关系热力提示', '周报自动生成实验风险清单'];
  return (
    <section className={className} id="page-inspirations">
      <PageHead title="创作灵感" sub="快速捕捉想法 · 标签归档 · 灵感回看">
        <div className="inspiration-head-stat"><span>{ideas.length}</span><small>IDEAS CAPTURED</small></div>
      </PageHead>
      <div className="inspiration-workspace">
        <aside className="inspiration-compose">
          <div className="chart-title">记录新灵感</div>
          <label className="field-label">标题</label><input className="input" placeholder="给这个想法一个短标题" />
          <label className="field-label">想法内容</label><textarea className="input inspiration-textarea" placeholder="随手记下画面、观点、选题、实验设想..." />
          <div className="inspiration-fields">
            <div><label className="field-label">标签</label><input className="input" placeholder="AI, 写作, 视频" /></div>
            <div><label className="field-label">类型</label><select className="input"><option>灵光一现</option><option>选题方向</option><option>视觉画面</option></select></div>
          </div>
          <button className="btn btn-primary block">保存灵感</button>
          <p className="hint">React 版当前使用本地演示数据，后续可接入 Electron 本地存储层。</p>
        </aside>
        <section className="inspiration-feed">
          <div className="inspiration-toolbar"><div className="chart-title">灵感档案 / IDEA ARCHIVE</div><input className="input" placeholder="搜索标题、内容或标签" /></div>
          <div className="inspiration-grid">{ideas.map((idea, index) => <article className="inspiration-card" key={idea}><span>IDEA / 0{index + 1}</span><h3>{idea}</h3><p>关联科研工作流、交互体验与自动化能力。</p><div className="tag-cloud"><span className="tag medium">WORKFLOW</span><span className="tag low">NOTE</span></div></article>)}</div>
        </section>
      </div>
    </section>
  );
}

function ReportsPage({ className = 'page active' }) {
  return (
    <section className={className} id="page-reports">
      <PageHead title="日报 / 周报" sub="自动汇总任务与记录，一键生成 Markdown 报告" />
      <div className="report-controls">
        <div className="seg"><button className="seg-btn active">日报</button><button className="seg-btn">周报</button></div>
        <input type="date" className="input" />
        <label className="check"><input type="checkbox" /> AI 润色</label>
        <button className="btn btn-primary">生成报告</button><button className="btn">导出 Markdown</button><button className="btn">导出选中（0）</button>
      </div>
      <div className="report-main">
        <div className="report-preview markdown">
          <h1>科研工作台日报</h1>
          <h2>今日完成</h2>
          <p>完成任务拆解、文献整理与项目结构扫描演示。</p>
          <h2>明日计划</h2>
          <ul><li>推进实验配置。</li><li>整理导师沟通问题。</li><li>导出周报初稿。</li></ul>
        </div>
        <div className="report-history">
          <div className="chart-title report-history-head"><span>历史报告</span><label className="check"><input type="checkbox" /> 全选</label></div>
          <div className="report-list">{['2026-08-11 日报', '2026-W33 周报', '2026-08-10 日报'].map((item) => <div className="report-item" key={item}><div className="r-title">{item}</div><div className="r-meta">LOCAL · MARKDOWN</div></div>)}</div>
        </div>
      </div>
    </section>
  );
}

function GithubPage({ className = 'page active' }) {
  return (
    <section className={className} id="page-github">
      <PageHead title="GitHub 热点追踪" sub="订阅关注领域与仓库 · 聚合热门趋势与更新动态" />
      <div className="gh-grid">
        <div className="gh-panel gh-subs-panel">
          <div className="chart-title">订阅管理 <small>关键词 / 仓库 · 上方添加</small></div>
          <div className="gh-add-row gh-add-row-top"><input className="input" placeholder="订阅关键词，如 deep learning / robotics" /><button className="btn">＋ 关键词</button><input className="input" placeholder="订阅仓库（链接或 owner/repo）" /><button className="btn">＋ 仓库</button></div>
          <div className="split gh-split">
            <div className="split-left"><div className="gh-tabs"><button className="gh-tab active">全部</button><button className="gh-tab">关键词</button><button className="gh-tab">仓库</button></div><input className="input gh-search" placeholder="搜索名称 / 关键词 / 语言 / 描述" /><div className="lit-list">{['react', 'openai/openai-node', 'electron/electron'].map((item, index) => <div className={`lit-item ${index === 0 ? 'active' : ''}`} key={item}><div className="l-title">{item}</div><div className="l-meta">订阅 · weekly signal</div></div>)}</div></div>
            <div className="split-right"><div className="gh-detail-empty">点击左侧订阅查看详情</div></div>
          </div>
        </div>
        <div className="gh-panel">
          <div className="chart-title">GitHub 官网热榜 <small>github.com/trending</small></div>
          <div className="row"><input className="input gh-lang-input" placeholder="语言/领域（留空 = 全领域）" /><select className="input gh-since"><option>每周</option><option>每日</option></select><button className="btn btn-primary">↻ 抓取</button></div>
          <div className="repo-list">{['open-source-agent', 'research-dashboard', 'paper-reader'].map((repo) => <div className="repo-item" key={repo}><div className="r-head"><span className="r-name">{repo}</span><span className="tag medium">★ 12.4k</span></div><div className="r-desc">适合科研、自动化或知识管理方向的热门仓库。</div><div className="r-meta">TypeScript · Updated today</div></div>)}</div>
          <div className="chart-title" style={{ marginTop: 16 }}>订阅仓库动态</div>
          <div className="release-list"><div className="release-item"><div className="rv-head"><span className="rv-tag">v1.5.2</span><span>2026-08-11</span></div><div className="rv-body">修复 Windows 启动与透明窗口表现。</div></div></div>
        </div>
      </div>
    </section>
  );
}

function TimePage({ className = 'page active' }) {
  return (
    <section className={className} id="page-time">
      <PageHead title="时间规划" sub={todayLabel()}><button className="btn">＋ 记录时间块</button></PageHead>
      <StatStrip stats={[{ label: '今日番茄', value: 3 }, { label: '今日专注', value: 145, unit: '分' }, { label: '本周时间', value: 860, unit: '分' }, { label: '累计时间', value: 42, unit: '时' }]} />
      <div className="time-grid">
        <div className="chart-card pomo-card">
          <div className="chart-title">番茄钟</div>
          <div className="pomo-layout">
            <div className="pomo-ring-wrap">
              <svg className="pomo-ring" viewBox="0 0 220 220" aria-hidden="true"><circle className="pomo-ring-track" cx="110" cy="110" r="96" /><circle className="pomo-ring-progress" cx="110" cy="110" r="96" style={{ strokeDasharray: 603, strokeDashoffset: 210 }} /></svg>
              <div className="pomo-ring-center"><strong>25:00</strong><span>READY / 待开始</span></div>
            </div>
            <div className="pomo-controls"><label className="field-label">专注时长（分钟）</label><input className="input" type="number" defaultValue="25" /><label className="field-label">休息时长（分钟）</label><input className="input" type="number" defaultValue="5" /><div className="seg"><button className="seg-btn active">专注</button><button className="seg-btn">工作</button><button className="seg-btn">学习</button><button className="seg-btn">阅读</button></div><div className="pomo-actions"><button className="btn btn-primary">开始</button><button className="btn">暂停</button><button className="btn">重置</button></div><div className="pomo-meta">今日完成 <b>3</b> 个番茄 · 专注 <b>145</b> 分钟</div></div>
          </div>
        </div>
        <ChartCard title="每日时间分布" type="daily" />
        <ChartCard title="每周时间分布" type="weekly" wide />
      </div>
      <div className="chart-card time-log-card">
        <div className="chart-title">手动时间块记录</div>
        <div className="row time-log-form"><select className="input"><option>工作</option><option>学习</option></select><input className="input" type="number" placeholder="时长（分钟）" /><input className="input" placeholder="备注（可选）" /><button className="btn btn-primary">记录</button></div>
        <div className="time-log-list"><div className="fit-day-row"><span>09:00 · 论文阅读</span><span className="fit-day-info">90 分钟</span></div><div className="fit-day-row"><span>14:00 · 实验复现</span><span className="fit-day-info">120 分钟</span></div></div>
      </div>
    </section>
  );
}

function DailyPlanPage({ className = 'page active', onOpenModal }) {
  const [mode, setMode] = useState('day');
  return (
    <section className={className} id="page-dailyPlan">
      <PageHead title="每日计划" sub="按日 / 按周规划日程 · 每日/每周模板 · 可一键转为任务">
        <div className="seg">{['day', 'week', 'templates'].map((key) => <button className={`seg-btn ${mode === key ? 'active' : ''}`} key={key} onClick={() => setMode(key)}>{{ day: '按日', week: '按周', templates: '模板' }[key]}</button>)}</div>
        <input type="date" className="input" />
        <button className="btn btn-primary" onClick={() => onOpenModal('plan')}>＋ 新增计划</button>
      </PageHead>
      {mode === 'day' ? (
        <div className="plan-day-view"><div className="plan-timeline">{[['09:00', '10:30', '阅读论文并整理摘要'], ['11:00', '12:00', '跑实验参数表'], ['15:00', '16:30', '写周报草稿']].map(([start, end, title], index) => <div className={`plan-item ${index === 2 ? 'done' : ''}`} key={title}><div className="plan-item-time"><b>{start}</b><span>{end}</span></div><div className="plan-item-main"><div className="plan-item-title">{title}</div><div className="plan-item-note">来自每日规划模板。</div><div className="plan-item-meta"><span className="tag medium">STUDY</span><span className="tag low">PLAN</span></div></div><div className="plan-item-actions"><button className="icon-btn">OK</button><button className="icon-btn">TASK</button></div></div>)}</div></div>
      ) : mode === 'week' ? (
        <div className="plan-week-view"><div className="plan-week-nav"><button className="btn">← 上周</button><span>2026-W33</span><button className="btn">下周 →</button><button className="btn">本周</button></div><div className="plan-week-grid">{['一', '二', '三', '四', '五', '六', '日'].map((day, index) => <div className={`plan-week-col ${index === 1 ? 'today' : ''}`} key={day}><div className="plan-week-head"><b>周{day}</b><span>{index + 11}</span></div><div className="plan-week-items"><div className="plan-week-item"><span className="pw-time">09:00</span><span className="pw-title">专注块</span></div><div className="plan-week-item done"><span className="pw-time">15:00</span><span className="pw-title">复盘</span></div></div></div>)}</div></div>
      ) : (
        <div className="plan-templates-view"><div className="plan-tpl-hint">模板是固定安排规则，例如每天 9 点阅读论文、每周五生成周报。</div><div className="plan-tpl-cols"><div className="plan-tpl-col"><div className="plan-tpl-head"><b>每日模板</b><small>3</small></div><div className="plan-tpl-list"><div className="plan-week-item">晨间阅读 · 09:00</div><div className="plan-week-item">实验记录 · 16:00</div></div></div><div className="plan-tpl-col"><div className="plan-tpl-head"><b>每周模板</b><small>2</small></div><div className="plan-tpl-list"><div className="plan-week-item">周报生成 · 周五</div></div></div></div></div>
      )}
    </section>
  );
}

function FitnessPage({ className = 'page active', onOpenModal }) {
  return (
    <section className={className} id="page-fitness">
      <PageHead title="运动健身" sub={todayLabel()}><button className="btn" onClick={() => onOpenModal('fitPlan')}>＋ 新增计划</button><button className="btn btn-primary" onClick={() => onOpenModal('fitLog')}>＋ 记录打卡</button></PageHead>
      <StatStrip stats={[{ label: '本周打卡', value: 4 }, { label: '计划完成率', value: 80, unit: '%' }, { label: '连续打卡', value: 5, unit: '天' }, { label: '近 7 天', value: 6 }]} />
      <div className="fit-grid">
        <div className="chart-card"><div className="chart-title">健身计划</div><div className="fit-plan-list">{['晨跑', '力量训练', '拉伸恢复'].map((name, index) => <div className="fit-plan-item" key={name}><div className="fit-plan-head"><span className="fit-plan-name">{name}</span><span className="tag medium">{index === 0 ? 'RUNNING' : 'TRAINING'}</span></div><div className="fit-plan-meta"><span>每周目标 <b>3</b> 次</span><span>单次 <b>30</b> 分钟</span><span>完成 <b className="ok">2</b></span></div><div className="fit-plan-note">保持轻量、可持续，不牺牲论文冲刺期精力。</div><div className="fit-plan-actions"><button className="btn btn-sm">今日完成</button><button className="btn btn-sm">跳过</button></div></div>)}</div></div>
        <div className="chart-card"><div className="chart-title">近 7 天打卡记录</div><div className="fit-recent-list">{['周二 · 跑步 30 分钟', '周三 · 力量 45 分钟', '周四 · 拉伸 20 分钟', '周五 · 跑步 30 分钟'].map((item) => <div className="fit-day-row" key={item}><span>{item}</span><span className="fit-day-info">DONE</span></div>)}</div></div>
      </div>
    </section>
  );
}

function SettingsPage({ className = 'page active' }) {
  return (
    <section className={className} id="page-settings">
      <PageHead title="设置" sub="AI 模型配置 · GitHub Token · 本地数据管理" />
      <div className="settings-grid">
        <div className="settings-card"><div className="chart-title">AI 服务配置</div><label className="field-label">模型服务商</label><select className="input"><option>DeepSeek</option><option>OpenAI</option><option>Ollama 本地</option></select><label className="field-label">Base URL</label><input className="input" placeholder="https://api.deepseek.com/v1" /><label className="field-label">模型名称</label><input className="input" placeholder="deepseek-chat" /><label className="field-label">API Key</label><input className="input" type="password" placeholder="sk-..." /><div className="row"><button className="btn btn-primary">保存配置</button><button className="btn">测试连接</button></div></div>
        <div className="settings-card"><div className="chart-title">Agent 个性化资料</div><label className="check"><input type="checkbox" /> 允许 Agent 只读使用以下资料</label><div className="row2"><div><label className="field-label">希望如何称呼你</label><input className="input" placeholder="例如：管理员" /></div><div><label className="field-label">身份 / 主要角色</label><input className="input" placeholder="例如：研究生" /></div></div><label className="field-label">偏好与约束</label><textarea className="input" rows="3" placeholder="下午需要休息；晚上只安排轻量任务" /><button className="btn btn-primary">保存个性化资料</button></div>
        <div className="settings-card"><div className="chart-title">GitHub 配置</div><label className="field-label">Personal Access Token</label><input className="input" type="password" placeholder="ghp_..." /><button className="btn">保存</button><div className="hint">不配置也可匿名使用，配置后可提升 API 限流。</div></div>
        <div className="settings-card"><div className="chart-title">Zotero 只读同步</div><div className="row2"><div><label className="field-label">文献库类型</label><select className="input"><option>个人文献库</option><option>群组文献库</option></select></div><div><label className="field-label">Library ID</label><input className="input" placeholder="数字 ID" /></div></div><label className="field-label">API Key</label><input className="input" type="password" /><div className="row"><button className="btn">测试只读连接</button><button className="btn btn-primary">同步到文献中心</button></div></div>
        <div className="settings-card"><div className="chart-title">文献界面</div><label className="field-label">文献字号</label><div className="seg"><button className="seg-btn">小</button><button className="seg-btn active">中</button><button className="seg-btn">大</button></div><div className="hint">文献列表、详情与分类树的字号三档切换。</div></div>
        <div className="settings-card"><div className="chart-title">本地数据</div><label className="field-label">数据存储目录</label><div className="code-line">Electron userData/data/</div><div className="row"><button className="btn">打开目录</button><button className="btn">立即备份</button></div></div>
      </div>
    </section>
  );
}

function ActivePage({ activePage, onOpenModal, onToast }) {
  const common = { onOpenModal, onToast };
  const pages = {
    tasks: <TasksPage {...common} />,
    board: <BoardPage />,
    literature: <LiteraturePage {...common} />,
    projects: <ProjectsPage />,
    inspirations: <InspirationsPage />,
    reports: <ReportsPage />,
    github: <GithubPage />,
    time: <TimePage />,
    dailyPlan: <DailyPlanPage {...common} />,
    fitness: <FitnessPage {...common} />,
    settings: <SettingsPage />
  };
  const page = pages[activePage] || pages.tasks;
  return cloneElement(page, {
    key: activePage,
    className: `${page.props.className || 'page active'} page-entering`.trim()
  });
}

function AgentTaskDrawer({ open, onClose }) {
  return (
    <>
      <div className={`drawer-mask ${open ? '' : 'hidden'}`} onClick={onClose} />
      <aside className={`task-center-drawer ${open ? 'open' : ''}`} aria-label="Agent 任务中心">
        <div className="task-center-head">
          <div><span>AGENT OPERATIONS</span><h2>任务中心</h2><p>规划、执行、验证与人工介入记录</p></div>
          <button className="btn-ghost" onClick={onClose}>×</button>
        </div>
        <div className="task-center-tools"><div className="seg"><button className="seg-btn active">全部</button><button className="seg-btn">进行中</button><button className="seg-btn">需处理</button><button className="seg-btn">已完成</button></div><button className="btn">清理已完成</button></div>
        <div className="task-center-body">
          <div className="task-center-list">
            {['PDF 摘要生成', '项目结构扫描', '周报草稿聚合'].map((item, index) => <button className={`task-center-item ${index === 0 ? 'active' : ''}`} key={item}><span className={`task-state ${index === 0 ? 'running' : 'done'}`}>{index === 0 ? 'RUNNING' : 'DONE'}</span><strong>{item}</strong><small>本地队列 · 自动执行</small><em>progress {index === 0 ? '68%' : '100%'}</em><span className="task-mini-progress"><i style={{ width: index === 0 ? '68%' : '100%' }} /></span></button>)}
          </div>
          <div className="task-center-detail">
            <div className="task-detail-head"><span className="task-state running">RUNNING</span><h3>PDF 摘要生成</h3><p>从文献中心导入的 PDF 正在提取正文、生成结构化摘要并等待人工确认。</p></div>
            <div className="task-detail-progress"><span><i style={{ width: '68%' }} /></span><b>68%</b></div>
            <section><label>执行步骤</label><ul className="task-step-timeline"><li className="done"><i /><div><b>读取 PDF 元数据</b><p>已完成。</p></div></li><li className="running"><i /><div><b>生成摘要草稿</b><p>正在输出研究问题、方法与结论。</p></div></li><li><i /><div><b>等待人工复核</b><p>确认后归档到文献中心。</p></div></li></ul></section>
          </div>
        </div>
      </aside>
    </>
  );
}

function AssistantDrawer({ open, onClose, onToast }) {
  return (
    <>
      <div className={`drawer-mask ${open ? '' : 'hidden'}`} onClick={onClose} />
      <aside className={`assistant-drawer ${open ? 'open' : ''}`}>
        <div className="drawer-head">
          <div><div className="drawer-title">AI / 智能助理</div><div className="drawer-sub">DeepSeek · OpenAI-compatible endpoint</div></div>
          <div className="drawer-actions"><button className="btn-ghost btn-xs" onClick={() => onToast('已新建对话', 'ok')}>＋</button><button className="btn-ghost btn-xs">☰</button><button className="btn-ghost btn-xs">⇩</button></div>
          <button className="btn-ghost" onClick={onClose}>×</button>
        </div>
        <div className="assistant-local-hint">历史仅保存在本机</div>
        <div className="chat-body">
          <div className="msg ai"><p>我会根据当前工作台上下文帮你拆任务、整理文献和生成报告。</p></div>
          <div className="msg user"><p>帮我看看今天适合先做什么？</p></div>
          <div className="msg ai"><p>建议先推进高优先级实验设计，然后把文献摘要归档，最后生成日报。</p></div>
        </div>
        <div className="chat-quick">{['安排日程', '今日洞察', '健身打卡', '记录时间', '总结进度'].map((item) => <button className="chip" key={item}>{item}</button>)}</div>
        <div className="chat-input-row"><textarea className="chat-input" rows="2" placeholder="向 AI 提问，可询问任务、文献、报告等" /><button className="btn btn-primary">发送</button></div>
      </aside>
    </>
  );
}

function Modal({ name, active, onClose }) {
  const content = {
    task: ['新建任务', ['任务标题', '优先级', '截止日期', '所属项目', '备注']],
    split: ['拆解为执行步骤', ['目标理解', '预期交付物', '执行步骤', '确认后如何应用']],
    literature: ['添加文献', ['标题', '作者', '期刊 / 会议', '年份', 'DOI / 链接', '原文摘要', '标签']],
    litCollection: ['新建分类', ['分类名称', '父分类']],
    litAssign: ['文献分类', ['选择分类', '保存批量归档']],
    plan: ['新增计划项', ['标题', '开始', '结束', '类型', '备注']],
    fitPlan: ['新增健身计划', ['计划名称', '类型', '每周目标', '单次时长', '备注']],
    fitLog: ['记录打卡', ['日期', '关联计划', '类型', '时长', '备注']]
  }[name];
  if (!content) return null;
  const [title, fields] = content;
  return (
    <div className={`modal-mask ${active ? '' : 'hidden'}`} onClick={onClose}>
      <div className={`modal ${name === 'literature' ? 'wide' : ''}`} onClick={(event) => event.stopPropagation()}>
        <h3>{title}</h3>
        <div className="row2">
          {fields.map((field, index) => (
            <div className={index === 0 && name === 'literature' ? 'span2' : ''} key={field}>
              <label className="field-label">{field}</label>
              {field.includes('备注') || field.includes('摘要') || field.includes('步骤') ? <textarea className="input" rows="3" /> : <input className="input" type={field.includes('日期') || field.includes('截止') ? 'date' : field.includes('开始') || field.includes('结束') ? 'time' : 'text'} />}
            </div>
          ))}
        </div>
        <div className="modal-actions"><button className="btn" onClick={onClose}>取消</button><button className="btn btn-primary" onClick={onClose}>保存</button></div>
      </div>
    </div>
  );
}

function PetWidget() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="pet-fab" title="与助手聊天" aria-label="桌面宠物" style={{ backgroundImage: 'url(/assets/pet/xaihi-half.png)' }} onClick={() => setOpen(true)} />
      <div className={`pet-chat ${open ? '' : 'hidden'}`}>
        <div className="pet-chat-head"><span className="pet-chat-name">塞西 · 助手</span><button className="pet-chat-close" onClick={() => setOpen(false)}>×</button></div>
        <div className="pet-chat-body chat-body"><div className="pet-chat-welcome">管理员，我是塞西。源石网络已经就绪，可以帮你生成日报、安排计划或记录打卡。</div></div>
        <div className="pet-chat-input"><input className="input" placeholder="和塞西说点什么" /><button className="btn btn-primary">发送</button></div>
      </div>
    </>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState('tasks');
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('research-workbench.sidebar-collapsed') === '1');
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [toasts, pushToast] = useToast();

  useEffect(() => {
    localStorage.setItem('research-workbench.sidebar-collapsed', collapsed ? '1' : '0');
    window.setTimeout(() => window.dispatchEvent(new Event('resize')), 280);
  }, [collapsed]);

  const mainClass = useMemo(() => `main ${lightPages.has(activePage) ? 'workspace-light' : ''}`, [activePage]);

  return (
    <>
      <BootSequence />
      <div className={`app ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar
          activePage={activePage}
          collapsed={collapsed}
          onNavigate={setActivePage}
          onToggle={() => setCollapsed((value) => !value)}
          onAssistant={() => setAssistantOpen(true)}
          onTasks={() => setAgentOpen(true)}
        />
        <main className={mainClass} data-workspace={activePage}>
          <div className="system-bar" aria-hidden="true">
            <span className="system-id">WB / 08.11</span>
            <img className="official-module-banner" src="/assets/official/banner.7b4f80c9.jpg" alt="" />
            <span className="system-track"><i /></span>
            <span>LOCAL CORE</span>
            <span className="system-state">SYSTEM ONLINE</span>
          </div>
          <ActivePage activePage={activePage} onOpenModal={setModal} onToast={pushToast} />
        </main>
      </div>
      <AgentTaskDrawer open={agentOpen} onClose={() => setAgentOpen(false)} />
      <AssistantDrawer open={assistantOpen} onClose={() => setAssistantOpen(false)} onToast={pushToast} />
      <Modal name={modal} active={!!modal} onClose={() => setModal(null)} />
      <PetWidget />
      <div id="toastRoot">{toasts.map((toast) => <div className={`toast ${toast.type === 'ok' ? 'ok' : toast.type === 'error' ? 'err' : ''}`} key={toast.id}>{toast.message}</div>)}</div>
    </>
  );
}
