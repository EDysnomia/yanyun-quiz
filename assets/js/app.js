(() => {
  "use strict";
  const questions = window.YanyunQuestions;
  const characters = window.YanyunCharacters;
  const readouts = window.YanyunReadouts;
  const axes = [
    ["担责", "守好本分", "主动补位"],
    ["人情", "先照顾眼前的人", "先稳住整体"],
    ["时机", "先查清再动", "边行动边确认"],
    ["规矩", "遵循原约", "随情势调整"],
    ["合作", "独立推进", "共同商议"],
    ["风险", "留足退路", "接受不确定性"]
  ];
  const storageKey = "yanyun-quiz-v1";
  const get = (id) => document.getElementById(id);
  const set = (id, value) => { get(id).textContent = value; };
  const screens = { home: "home-title", intro: "intro-title", quiz: "question", result: "hero-name" };
  let answers = Array(questions.length).fill(null);
  let position = 0;
  let currentResult;

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.answers) && saved.answers.length === questions.length) {
      answers = saved.answers.map((answer) => Number.isInteger(answer) && answer >= 0 && answer <= 3 ? answer : null);
      const firstOpen = answers.indexOf(null);
      const limit = firstOpen < 0 ? questions.length - 1 : firstOpen;
      position = Number.isInteger(saved.position) ? Math.max(0, Math.min(limit, saved.position)) : limit;
    }
  } catch {
    // Storage can be unavailable in private browsing or when opening a local file.
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ answers, position }));
    } catch {
      // The current attempt remains usable in memory.
    }
  }

  function show(screen) {
    for (const id of Object.keys(screens)) get(id).hidden = id !== screen;
    window.scrollTo(0, 0);
    get(screens[screen]).focus({ preventScroll: true });
  }

  function showHome() {
    const label = answers.every((answer) => answer !== null) ? "查看结果" :
      answers.some((answer) => answer !== null) ? "继续答题" : "入卷答题";
    set("start", label + " →");
    show("home");
  }

  function renderQuestion() {
    const [axis, scene, prompt, ...choices] = questions[position];
    set("scene", scene);
    set("question", prompt);
    set("counter", `第 ${position + 1} / ${questions.length} 题`);
    set("question-index", "问卷 · " + String(position + 1).padStart(2, "0"));
    updateProgress();
    const fieldset = get("options");
    fieldset.querySelectorAll(".option").forEach((option) => option.remove());
    // Rotate the four options to vary the position of each scoring direction.
    const offset = (Math.floor(position / axes.length) + axis) % 4;
    for (let index = 0; index < choices.length; index++) {
      const value = (index + offset) % choices.length;
      const label = document.createElement("label");
      label.className = "option";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "answer";
      input.value = value;
      input.checked = answers[position] === value;
      const letter = document.createElement("span");
      letter.className = "option-letter";
      letter.setAttribute("aria-hidden", "true");
      letter.textContent = "ABCD"[index];
      label.append(input, letter, document.createTextNode(choices[value]));
      fieldset.append(label);
    }
    get("previous").disabled = position === 0;
    get("next").disabled = answers[position] === null;
    set("next", position === questions.length - 1 ? "查看结果 →" : "下一题 →");
    show("quiz");
  }

  function updateProgress() {
    const count = answers.filter((answer) => answer !== null).length;
    get("progress").value = count;
    set("percent", Math.round(count / questions.length * 100) + "%");
  }

  function profile() {
    const totals = axes.map(() => 0);
    const counts = axes.map(() => 0);
    questions.forEach(([axis], index) => {
      totals[axis] += answers[index] * (100 / 3);
      counts[axis]++;
    });
    return totals.map((total, axis) => total / counts[axis]);
  }

  function rank(user) {
    return characters.map(([name, region, line, story, trait, limit, values]) => {
      const similarity = values.map((value, axis) => 100 - Math.abs(value - user[axis]));
      const average = similarity.reduce((sum, value) => sum + value, 0) / axes.length;
      return { name, region, line, story, trait, limit, values, similarity, average };
    }).sort((a, b) => b.average - a.average);
  }

  function closest(match) {
    return axes.map((_, axis) => axis).sort((a, b) => match.similarity[b] - match.similarity[a]);
  }

  function renderRadar(id, user, hero) {
    const point = (axis, value) => {
      const angle = axis * Math.PI / 3 - Math.PI / 2;
      return [175 + 86 * value * Math.cos(angle), 119 + 86 * value * Math.sin(angle)];
    };
    const polygon = (values) => values.map((value, axis) => point(axis, value / 100).join(",")).join(" ");
    const rings = [25, 50, 75, 100].map((level) => `<polygon points="${polygon(axes.map(() => level))}" fill="none" stroke="#d3cab7"/>`).join("");
    const labels = axes.map(([label], axis) => {
      const [x, y] = point(axis, 1.22);
      return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" fill="#20322c" font-size="13">${label}</text>`;
    }).join("");
    get(id).innerHTML = `<svg viewBox="0 0 350 238" role="img" aria-label="六项处事倾向对照图，你的画像用实线，人物画像用虚线">${rings}
      <polygon points="${polygon(user)}" fill="#29473e27" stroke="#29473e" stroke-width="2.5"/>
      <polygon points="${polygon(hero)}" fill="none" stroke="#8b392c" stroke-width="2.5" stroke-dasharray="5 4"/>${labels}</svg>`;
  }

  function describe(axis, value) {
    const [, left, right] = axes[axis];
    if (value < 38) return `偏向「${left}」`;
    if (value > 62) return `偏向「${right}」`;
    return `会在「${left}」与「${right}」之间视情况取舍`;
  }

  function renderReadout(id, match, user, count) {
    get(id).replaceChildren(...closest(match).slice(0, count).map((axis) => {
      const paragraph = document.createElement("p");
      const label = document.createElement("strong");
      label.textContent = `${axes[axis][0]} · ${Math.round(match.similarity[axis])}%`;
      const you = describe(axis, user[axis]);
      const them = describe(axis, match.values[axis]);
      paragraph.append(label, you === them ? `你们都${you}。` : `你${you}；${match.name}${them}。`);
      return paragraph;
    }));
  }

  function renderDimensions(id, match, user) {
    const root = get(id);
    root.replaceChildren();
    axes.forEach(([label, left, right], axis) => {
      const item = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = label;
      description.textContent = Math.round(match.similarity[axis]) + "%";
      description.title = `${left} → ${right}。你 ${Math.round(user[axis])}，人物 ${match.values[axis]}`;
      item.append(term, description);
      root.append(item);
    });
  }

  function renderResult() {
    const user = profile();
    const [main, second] = rank(user);
    currentResult = { main, second };
    set("hero-name", main.name);
    set("hero-region", main.region);
    set("hero-line", main.line);
    set("hero-score", Math.round(main.average) + "%");
    set("hero-story", main.story);
    set("report-title", `为什么你像${main.name}？`);
    set("hero-trait", main.trait);
    set("hero-readout", readouts[main.name]);
    renderReadout("hero-axes", main, user, 3);
    set("hero-limit", main.limit);
    const gap = closest(main).at(-1);
    const difference = main.similarity[gap] < 85;
    get("hero-difference").hidden = !difference;
    set("hero-difference", difference ? `你们差异最大的一项是「${axes[gap][0]}」。你${describe(gap, user[gap])}，${main.name}${describe(gap, main.values[gap])}（你的倾向 ${Math.round(user[gap])}，人物画像 ${main.values[gap]}）。` : "");
    renderRadar("radar", user, main.values);
    renderDimensions("dimensions", main, user);
    set("second-name", second.name);
    set("second-region", second.region);
    set("second-line", second.line);
    set("second-score", Math.round(second.average) + "%");
    const secondAxes = closest(second);
    set("second-story", second.story);
    set("second-trait", second.trait);
    set("second-readout", readouts[second.name]);
    renderReadout("second-axes", second, user, 2);
    const distinctive = secondAxes.find((axis) => second.similarity[axis] > main.similarity[axis] + 0.01);
    const mainLead = axes[closest(main)[0]][0];
    const secondLead = axes[secondAxes[0]][0];
    set("second-angle", distinctive === undefined ?
      `你与${main.name}最相似的一项是「${mainLead}」，与${second.name}最相似的一项是「${secondLead}」。${second.limit}` :
      `你与${main.name}最相似的一项是「${mainLead}」。在「${axes[distinctive][0]}」上，你与${second.name}的画像更接近。${second.limit}`);
    renderDimensions("second-dimensions", second, user);
    renderRadar("second-radar", user, second.values);
    get("result").querySelector("details").open = false;
    set("status", "");
    show("result");
  }

  async function downloadResult() {
    const button = get("share");
    button.disabled = true;
    try {
      const { main, second } = currentResult;
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 650;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#29473e";
      ctx.fillRect(0, 0, 1080, 650);
      const artwork = get("home").querySelector("img");
      try {
        if (!artwork.complete) await artwork.decode();
        if (!artwork.naturalWidth) throw new Error("插画未加载");
        const crop = artwork.naturalHeight * 410 / 650;
        ctx.drawImage(artwork, (artwork.naturalWidth - crop) / 2, 0, crop, artwork.naturalHeight, 670, 0, 410, 650);
      } catch {
        // The card still works if the illustration could not load.
      }
      const gradient = ctx.createLinearGradient(650, 0, 795, 0);
      gradient.addColorStop(0, "#29473e");
      gradient.addColorStop(1, "#29473e00");
      ctx.fillStyle = gradient;
      ctx.fillRect(650, 0, 145, 650);
      ctx.fillStyle = "#fff5df";
      ctx.font = "25px Microsoft YaHei, sans-serif";
      ctx.fillText("燕云故人   /   江湖人物匹配", 60, 76);
      ctx.font = "25px Microsoft YaHei, sans-serif";
      ctx.fillText(main.region, 60, 190);
      ctx.font = "bold 86px SimSun, serif";
      ctx.fillText(main.name, 60, 295, 580);
      ctx.font = "32px SimSun, serif";
      ctx.fillText(main.line, 60, 355, 580);
      ctx.fillStyle = "#ffd4a0";
      ctx.font = "bold 52px Microsoft YaHei, sans-serif";
      ctx.fillText(Math.round(main.average) + "%", 60, 440);
      ctx.fillStyle = "#fff5df";
      ctx.font = "25px Microsoft YaHei, sans-serif";
      ctx.fillText(`副匹配  ${second.name}  ·  ${Math.round(second.average)}%`, 60, 510);
      const traits = closest(main).slice(0, 2).map((axis) => axes[axis][0]);
      ctx.fillText(`最相近的倾向  ${traits.join(" · ")}`, 60, 550);
      ctx.font = "18px Microsoft YaHei, sans-serif";
      ctx.fillText("《燕云十六声》同人测试 · 结果仅供娱乐", 60, 608);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("结果卡导出失败");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "燕云故人-" + main.name + ".png";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      set("status", "结果卡已生成。");
    } catch {
      set("status", "结果卡生成失败，请重试。");
    } finally {
      button.disabled = false;
    }
  }

  ["home-link", "intro-back", "exit", "result-home"].forEach((id) => get(id).addEventListener("click", showHome));
  get("start").addEventListener("click", () => {
    if (answers.every((answer) => answer !== null)) renderResult();
    else if (answers.some((answer) => answer !== null)) renderQuestion();
    else show("intro");
  });
  get("begin").addEventListener("click", renderQuestion);
  get("quiz-form").addEventListener("change", (event) => {
    if (event.target.name !== "answer") return;
    answers[position] = Number(event.target.value);
    get("next").disabled = false;
    updateProgress();
    save();
  });
  get("quiz-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (answers[position] === null) return;
    if (position === questions.length - 1) {
      renderResult();
      return;
    }
    position++;
    save();
    renderQuestion();
  });
  get("previous").addEventListener("click", () => {
    if (position === 0) return;
    position--;
    save();
    renderQuestion();
  });
  get("retake").addEventListener("click", () => {
    if (!window.confirm("清除本次答案并重新开始？")) return;
    answers.fill(null);
    position = 0;
    currentResult = undefined;
    save();
    showHome();
  });
  get("share").addEventListener("click", downloadResult);
  if (answers.some((answer) => answer !== null)) {
    set("start", answers.every((answer) => answer !== null) ? "查看结果 →" : "继续答题 →");
  }
})();
