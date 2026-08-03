const configuredVersion = process.env.NEXT_PUBLIC_MONICA_VERSION?.trim();

if (!configuredVersion) {
  throw new Error("NEXT_PUBLIC_MONICA_VERSION must be provided by next.config.ts.");
}

const version = configuredVersion.split("+", 1)[0];
const prereleaseSeparator = version.indexOf("-");
const baseVersion = prereleaseSeparator < 0 ? version : version.slice(0, prereleaseSeparator);
const prereleaseLabel = prereleaseSeparator < 0
  ? null
  : version.slice(prereleaseSeparator + 1).toUpperCase();

export const monicaRelease = Object.freeze({
  version,
  baseVersion,
  prereleaseLabel,
  isPrerelease: prereleaseLabel !== null,
  label: version.toUpperCase(),
  templatePackage: `Monica.Templates@${version}`,
});
