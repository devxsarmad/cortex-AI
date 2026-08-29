export const getCurrentTime = (timeZone?: string) => {
  const resolvedTimeZone = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const now = new Date();

  return {
    iso: now.toISOString(),
    timeZone: resolvedTimeZone,
    local: new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeStyle: "long",
      timeZone: resolvedTimeZone
    }).format(now)
  };
};
