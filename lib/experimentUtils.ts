/*
 * Copied from https://searchfox.org/mozilla-central/source/browser/components/newtab/lib/MessagingExperimentConstants.sys.mjs
 *
 * Currently needs to be manually kept up to date.
 */

/**
 * These are the Nimbus feature IDs that correspond to messaging experiments.
 * Other Nimbus features contain specific variables whose keys are enumerated in
 * FeatureManifest.yaml. Conversely, messaging experiment features contain
 * actual messages, with the usual message keys like `template` and `targeting`.
 * @see FeatureManifest.yaml
 */
export const MESSAGING_EXPERIMENTS_DEFAULT_FEATURES : string[] = [
  "backgroundTaskMessage", // XXX need to backport this to tree
  "cfr",
  "fxms-message-1",
  "fxms-message-2",
  "fxms-message-3",
  "fxms-message-4",
  "fxms-message-5",
  "fxms-message-6",
  "fxms-message-7",
  "fxms-message-8",
  "fxms-message-9",
  "fxms-message-10",
  "fxms-message-11",
  "infobar",
  "moments-page",
  "pbNewtab",
  "spotlight",
  "featureCallout",
];

import { types, typeGuards } from "@mozilla/nimbus-shared"
type NimbusExperiment = types.experiments.NimbusExperiment;

export function usesMessagingFeatures(recipe : NimbusExperiment): boolean {
  // XXX iterate through all features instead of just checking the first
  // XXX figure out how to better handle the ?
  let featureId : string = (recipe as any)?.featureIds[0];
  if (MESSAGING_EXPERIMENTS_DEFAULT_FEATURES.includes(featureId)) {
      return true;
  }
  return false;
}
