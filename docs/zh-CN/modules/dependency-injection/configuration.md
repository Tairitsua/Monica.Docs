---
title: Configuration
description: DependencyInjection 的公开选项、默认值与必需设置。
sidebar_position: 3
---

# Configuration

## Module options

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `EnableAutoRegistrationLogging` | `bool` | `false` | 否 | 你要排查生命周期推断、暴露服务或自动注册结果时 | 只影响启动期日志输出；诊断快照本身仍会被记录。 |
