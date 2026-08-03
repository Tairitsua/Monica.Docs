FROM mcr.microsoft.com/dotnet/sdk:10.0 AS dotnet-build
WORKDIR /src

COPY MoLibrary ./MoLibrary
COPY Monica.Docs ./Monica.Docs

WORKDIR /src/Monica.Docs
RUN dotnet restore Monica.Docs.slnx

FROM dotnet-build AS api-build
RUN dotnet publish src/AppHost/Monica.Docs.Api/Monica.Docs.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore \
    -p:EnableSourceControlManagerQueries=false

FROM dotnet-build AS demo-build
RUN dotnet publish src/AppHost/Monica.Docs.Demo/Monica.Docs.Demo.csproj \
    -c Release \
    -o /app/publish \
    --no-restore \
    -p:EnableSourceControlManagerQueries=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS api
WORKDIR /app
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
ENV ASPNETCORE_ENVIRONMENT=Production
COPY --from=api-build /app/publish ./
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "Monica.Docs.Api.dll"]

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS demo
WORKDIR /app
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
ENV ASPNETCORE_ENVIRONMENT=Production
COPY --from=demo-build /app/publish ./
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["/bin/sh", "-c", "rm -f /app/state/monica-configuration.sqlite* && cp /app/docs-external-settings.json /app/state/docs-external-settings.json && exec dotnet Monica.Docs.Demo.dll"]

FROM node:22-alpine AS web-build
WORKDIR /src/Monica.Docs/frontend/monica-docs-web
COPY MoLibrary/Directory.Build.props /src/MoLibrary/Directory.Build.props
COPY Monica.Docs/frontend/monica-docs-web/package.json ./
COPY Monica.Docs/frontend/monica-docs-web/package-lock.json ./
RUN npm ci
COPY Monica.Docs/frontend/monica-docs-web ./
RUN npm run build

FROM node:22-alpine AS web
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV MONICA_VERSION_PROPS_PATH=/app/Monica.Directory.Build.props
COPY --from=web-build /src/Monica.Docs/frontend/monica-docs-web/package.json ./
COPY --from=web-build /src/Monica.Docs/frontend/monica-docs-web/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY --from=web-build /src/Monica.Docs/frontend/monica-docs-web/.next ./.next
COPY --from=web-build /src/Monica.Docs/frontend/monica-docs-web/next.config.ts ./next.config.ts
COPY --from=web-build /src/MoLibrary/Directory.Build.props ./Monica.Directory.Build.props
USER node
EXPOSE 3000
CMD ["npm", "run", "start"]
