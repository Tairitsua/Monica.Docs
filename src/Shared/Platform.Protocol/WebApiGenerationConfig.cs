using Monica.WebApi.Annotations;

[assembly: WebApiGenerationConfig(
    "api/v1",
    RpcClientTargets = RpcClientGenerationTargets.Http | RpcClientGenerationTargets.Local)]
