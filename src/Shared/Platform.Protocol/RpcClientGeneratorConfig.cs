using Monica.WebApi.AutoControllers.Annotations;
using Monica.WebApi.RpcClient.Annotations;

[assembly: AutoControllerConfig(SkipGeneration = true)]
[assembly: RpcClientConfig(
    AddHttpImplementations = true,
    AddLocalImplementations = true)]
