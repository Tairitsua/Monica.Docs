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
ARG MONICA_AGENT_SKILL_REF
ENV MONICA_AGENT_SKILL_REF=$MONICA_AGENT_SKILL_REF
ENV MONICA_PUBLIC_RELEASE_BUILD=1
ENV MONICA_RELEASE_SMOKE_CONTAINER=1
COPY MoLibrary/Directory.Build.props /src/MoLibrary/Directory.Build.props
COPY MoLibrary/.monica/agent-skill-catalog.json /src/MoLibrary/.monica/agent-skill-catalog.json
COPY MoLibrary/skills/monica-guide/assets/bootstrap-prompts.json /src/MoLibrary/skills/monica-guide/assets/bootstrap-prompts.json
COPY Monica.Docs/frontend/monica-docs-web/package.json ./
COPY Monica.Docs/frontend/monica-docs-web/package-lock.json ./
RUN apk add --no-cache git python3 && npm ci
COPY Monica.Docs/frontend/monica-docs-web ./
COPY Monica.Docs/scripts/validate_release_version.py /src/Monica.Docs/scripts/validate_release_version.py
RUN npm run validate:guide-prompts:production
RUN npm run verify:guide-release:production
RUN npm run build

FROM node:22-alpine AS web
WORKDIR /app
ARG MONICA_AGENT_SKILL_REF
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV MONICA_VERSION_PROPS_PATH=/app/Monica.Directory.Build.props
ENV MONICA_GUIDE_PROMPTS_PATH=/app/bootstrap-prompts.json
ENV MONICA_AGENT_SKILL_CATALOG_PATH=/app/agent-skill-catalog.json
ENV MONICA_AGENT_SKILL_REF=$MONICA_AGENT_SKILL_REF
ENV MONICA_PUBLIC_RELEASE_BUILD=1
COPY --from=web-build /src/Monica.Docs/frontend/monica-docs-web/package.json ./
COPY --from=web-build /src/Monica.Docs/frontend/monica-docs-web/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY --chown=node:node --from=web-build /src/Monica.Docs/frontend/monica-docs-web/.next ./.next
COPY --from=web-build /src/Monica.Docs/frontend/monica-docs-web/next.config.ts ./next.config.ts
COPY --from=web-build /src/Monica.Docs/frontend/monica-docs-web/scripts ./scripts
COPY --from=web-build /src/MoLibrary/Directory.Build.props ./Monica.Directory.Build.props
COPY --from=web-build /src/MoLibrary/.monica/agent-skill-catalog.json ./agent-skill-catalog.json
COPY --from=web-build /src/MoLibrary/skills/monica-guide/assets/bootstrap-prompts.json ./bootstrap-prompts.json
USER node
EXPOSE 3000
CMD ["npm", "run", "start"]
