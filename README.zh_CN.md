# Monica.Docs

<p align="center">
  <a href="https://github.com/Tairitsua/Monica.Docs/blob/main/LICENSE.txt"><img src="https://img.shields.io/github/license/Tairitsua/Monica.Docs" alt="License"></a>
  <a href="https://monica.dpdns.org/"><img src="https://img.shields.io/badge/docs-online-brightgreen.svg" alt="Documentation"></a>
</p>

<p align="center">
  <a href="README.md">English</a> | 简体中文
</p>

> Monica 官方文档站点，同时也是一个用 Monica 自身构建的可运行模块化单体示例。

## 这个仓库是什么

- <https://monica.dpdns.org/> 的源码
- 一个能直接运行的 Monica 示例，展示 domain-first 的 modular monolith 结构
- 文档产品和后端示例共存的仓库

如果你是来读文档的，先去网站。如果你是来理解 Monica 的项目结构，先看 `src/`。

## 快速开始

### 本地阅读文档

```bash
dotnet run --project src/AppHost/Monica.Docs.Api/Monica.Docs.Api.csproj
```

然后打开：

- `http://localhost:5298`
- `/markdown-docs`，查看 markdown 文档页面

### 挂载自己的 docs 目录

```bash
docker run -p 8080:8080 \
  -v $(pwd)/docs:/docs \
  monica-docs
```

AppHost 的 docs 解析顺序是：显式路径、首选挂载路径、AppHost 本地 `docs/`、仓库根目录 `docs/`。

## 仓库内容

- `src/AppHost/Monica.Docs.Api` - 仅负责组合的 AppHost
- `src/Domains/Documentation` - 文档领域
- `src/Domains/LocalRpcProvider` - 示例宿主的本地 RPC 支持
- `src/Shared/Platform.*` - 共享协议层与基础设施层
- `docs/` - 驱动文档站点的 markdown 源文件
- `frontend/` - 未来的解耦前端预留目录

## Monica 在这个宿主里

这个 AppHost 会和文档站点一起运行真实的 Monica 模块：

- ModuleSystem 和 ProjectUnits 展示宿主的组合方式，以及当前可用的 ProjectUnit。
- JobScheduler 通过 Monica 的调度基础设施运行 docs sync worker。
- 因此这个仓库既是官方文档源码，也是一个可以直接运行的 Monica modular-monolith 示例。

## 架构说明

完整的架构说明已移动到 [architecture-spec.md](architecture-spec.md)。

## 相关仓库

- Monica 框架：<https://github.com/Tairitsua/Monica>
- 在线文档：<https://monica.dpdns.org/>
- MIT 许可证：见 [LICENSE.txt](LICENSE.txt)
