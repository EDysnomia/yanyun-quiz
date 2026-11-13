# 燕云故人

《燕云十六声》同人人物匹配测试。30 道原创情境题覆盖 6 项处事倾向，答完后从 34 位人物中匹配主、副结果。

## 发布到 GitHub Pages

1. 把本目录里的文件和文件夹放到 GitHub 仓库根目录，保留 `.nojekyll`。仓库根目录应直接看到 `index.html`。
2. 在仓库 **Settings → Pages** 选择 **Deploy from a branch**。
3. 选择存放文件的分支（如 `main`）和 **/ (root)**，点击 **Save**。
4. 部署完成后，从 Pages 设置页打开站点。相对路径支持项目站点的仓库子路径。

本地预览可在项目目录运行 `python -m http.server 8000`，再打开 `http://localhost:8000/`。站点无需构建。

## 文件结构

```text
index.html
.nojekyll
assets/
  css/site.css          响应式排版与视觉样式
  js/questions.js       题干、选项、场景与计分维度
  js/characters.js      人物档案、原创题签与六维画像
  js/readouts.js        34 位人物各自的处事场景分析
  js/app.js             答题、续答、匹配、雷达图和 PNG 导出
  images/jianghu.webp    原创水墨插画
```

每项倾向有五道题，四个选项由该维度的一端排列到另一端，页面展示时轮换选项顺序。用户画像以每维平均值计算，匹配度是六个维度的接近程度取平均。答案保存在当前浏览器的本地存储。

## 人物资料

- 清河与开封见[清河主题站](https://www.yysls.cn/2024/yydsj/qh/)和[开封主题站](https://www.yysls.cn/2025/yydsj/kf/)。
- 河西见[河西剧情解读](https://news.17173.com/content/04212025/125102847.shtml)、[主线实录](https://www.bilibili.com/video/BV1bsTuzkEAd/)和[河西终卷实录](https://www.bilibili.com/video/BV1AeydBCERY/)。
- 不见山见[机核区域剧情评论](https://www.gcores.com/articles/210353)和游戏内「金乌衔枝」「山中见墨」。
- 青州、江南与未央城参考[青州见闻](https://yy16s.huijiwiki.com/wiki/见闻/青州)、[江南见闻](https://yy16s.huijiwiki.com/wiki/见闻/江南)、[江南主线文本](https://yy16s.huijiwiki.com/wiki/最忆江南)、[未央城主题介绍](https://www.yysls.cn/news/official/20261012/37780_1316330.html)和[人物传记录屏](https://www.bilibili.com/video/BV1YzXXYrETE/)。

题签、题库与数值画像为测试创作。游戏名称、角色与设定归原权利方所有。
