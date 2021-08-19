import { Settings } from "../../generated/schema";

export function createOrLoadSettings(): Settings {
  let settings = Settings.load("1");

  if (!settings) {
    settings = new Settings("1");

    settings.poolPaused = false;
    settings.poolValidatorsPaused = false;
    settings.save();
  }
  return settings as Settings;
}
