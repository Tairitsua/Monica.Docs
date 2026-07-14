# Monica.Docs

<p align="center">
  <a href="https://github.com/Tairitsua/Monica.Docs/blob/main/LICENSE.txt"><img src="https://img.shields.io/github/license/Tairitsua/Monica.Docs" alt="License"></a>
  <a href="https://monica.dpdns.org/"><img src="https://img.shields.io/badge/docs-online-brightgreen.svg" alt="Documentation"></a>
</p>

<p align="center">
  <a href="README.md">English</a> | 简体中文
</p>

> Monica 的公开产品站与双语文档：面向可观测 .NET 后端的、由智能体也能遵循的应用架构。

这个仓库包含三个有意隔离的产品：

- 面向 <https://monica.dpdns.org/> 的 Next.js 官网
- 面向 `api.monica.dpdns.org` 的只读文档 API
- 用于探索框架能力的 Monica 模块化单体演示宿主

公开 API 与可重置的演示面完全隔离，避免生产文档服务意外暴露 showcase 端点。

## 运行公开文档栈

先启动只读 API：

```bash
dotnet run --project src/AppHost/Monica.Docs.PublicApi/Monica.Docs.PublicApi.csproj
```

在另一个终端启动网站：

```bash
cd frontend/monica-docs-web
npm install
MONICA_DOCS_API_URL=http://localhost:5082 npm run dev
```

打开 <http://localhost:3000>。主要路由包括：

- `/` 与 `/zh-CN`：本地化产品主页
- `/docs` 与 `/zh-CN/docs`：文档与搜索
- `/modules`：完整的 Stable / Integrations / Labs 包目录
- `/reference`：官方模板与 Ordering 参考应用
- `/roadmap`：公开发布门槛与承诺

未配置 `MONICA_DOCS_API_URL` 或 API 暂时不可达时，前端会显示内置的精简启动指南，而不是空白失败页。

## 运行完整演示宿主

```bash
dotnet run --project src/AppHost/Monica.Docs.Api/Monica.Docs.Api.csproj
```

演示宿主会运行 Monica UI、JobScheduler、文档同步与本地 RPC。它有意比公开 API 更宽，不是 `api.monica.dpdns.org` 的部署目标。

## 主机绑定的 Monica 组合

每个宿主只拥有一张显式模块图：

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.ConfigureApplication(options =>
    {
        options.AppName = "Monica Documentation API";
        options.AppId = "monica-docs-public-api";
    });

    monica.AddMarkdown()
        .EnableMultilingualDocuments()
        .AddDocumentGroup("monica", "Monica Docs", docsBasePath);
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

框架不再存在环境式注册单例，也不依赖注册阶段的 service locator。完整模块图会先针对所属宿主完成收集与验证，再进入构建阶段。

## 仓库结构

```text
docs/                                      双语 Markdown 源文档
frontend/monica-docs-web/                  Next.js 16 / React 19 官网
src/AppHost/Monica.Docs.PublicApi/         只读公开文档 API
src/AppHost/Monica.Docs.Api/               完整、可重置的 Monica 演示宿主
src/Domains/Documentation/                 文档限界上下文
src/Domains/Showcase/                      仅演示环境使用的行为
src/Domains/LocalRpcProvider/               本地 RPC 示例边界
src/Shared/Platform.*                      共享协议与基础设施层
```

可以通过 `DocumentationApi__DocsBasePath` 更改文档源位置。未显式配置时，宿主会依次检查首选的 `/docs` 挂载路径与仓库相对开发路径。

## 质量检查

```bash
dotnet build Monica.Docs.slnx -m

cd frontend/monica-docs-web
npm run check
npm audit --omit=dev
```

前端字体和图标均来自本地 npm 依赖；生产渲染不依赖浏览器动态加载 CDN 资源。

## 相关项目

- Monica 框架：<https://github.com/Tairitsua/Monica>
- 在线文档：<https://monica.dpdns.org/>
- 架构说明：[architecture-spec.md](architecture-spec.md)
- MIT 许可证：[LICENSE.txt](LICENSE.txt)
