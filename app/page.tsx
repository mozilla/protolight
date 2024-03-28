import { types } from "@mozilla/nimbus-shared";
import { BranchInfo, RecipeOrBranchInfo, experimentColumns, FxMSMessageInfo, fxmsMessageColumns } from "./columns";
import { getDashboard, getDisplayNameForTemplate, getTemplateFromMessage, _isAboutWelcomeTemplate, getPreviewLink } from "../lib/messageUtils.ts";
import { NimbusRecipeCollection } from '@/lib/nimbusRecipeCollection'
import { _substituteLocalizations } from "../lib/experimentUtils.ts";

import { NimbusRecipe } from "../lib/nimbusRecipe.ts"
import { MessageTable } from "./message-table";
import { getProposedEndDate, usesMessagingFeatures } from "../lib/experimentUtils.ts";
import Link from "next/link";

function getASRouterLocalColumnFromJSON(messageDef: any) : FxMSMessageInfo {
  let fxmsMsgInfo : FxMSMessageInfo = {
    product: 'Desktop',
    release: 'Fx 123',
    id: messageDef.id,
    template: messageDef.template,
    topic: messageDef.provider,
    surface: getDisplayNameForTemplate(getTemplateFromMessage(messageDef)),
    segment: 'some segment',
    metrics: 'some metrics',
    ctrPercent: .5, // getMeFromLooker
    ctrPercentChange: 2, // getMeFromLooker
    previewLink: getPreviewLink(messageDef),
  };

  fxmsMsgInfo.ctrDashboardLink = getDashboard(messageDef.template, messageDef.id)

  return fxmsMsgInfo
}

let columnsShown = false;

type NimbusExperiment = types.experiments.NimbusExperiment;


async function getASRouterLocalMessageInfoFromFile(): Promise<FxMSMessageInfo[]> {
  const fs = require("fs");

  let data = fs.readFileSync(
    "lib/asrouter-local-prod-messages/123-nightly-in-progress.json",
    "utf8");
  let json_data = JSON.parse(data);

  let messages : FxMSMessageInfo[] =
    json_data.map((messageDef : any) : FxMSMessageInfo => getASRouterLocalColumnFromJSON(messageDef));

  return messages;
}

async function getMsgExpRecipeCollection(): Promise<NimbusRecipeCollection> {

  const recipeCollection = new NimbusRecipeCollection()
  await recipeCollection.fetchRecipes()
  console.log('recipeCollection.length = ', recipeCollection.recipes.length)


  // XXX should move to nimbusRecipe
  function isExpRecipe(recipe : NimbusRecipe) : boolean {
    return !recipe._rawRecipe.isRollout
  }

  const expOnlyCollection = new NimbusRecipeCollection()
  expOnlyCollection.recipes = recipeCollection.recipes.filter(isExpRecipe)
  console.log('expOnlyCollection.length = ', expOnlyCollection.recipes.length)


  // XXX should move to nimbusRecipe
  function isMsgRecipe(recipe : NimbusRecipe) : boolean {
    return usesMessagingFeatures(recipe._rawRecipe)
  }

  const msgExpRecipeCollection = new NimbusRecipeCollection()
  msgExpRecipeCollection.recipes =
    expOnlyCollection.recipes.filter(isMsgRecipe)
  console.log('msgExpRecipeCollection.length = ', msgExpRecipeCollection.recipes.length)

  return msgExpRecipeCollection
}

export default async function Dashboard() {
  // XXX await Promise.all for both loads concurrently
  const localData = await getASRouterLocalMessageInfoFromFile()
  const msgExpRecipeCollection = await getMsgExpRecipeCollection()

  // get in format useable by MessageTable
  const experimentAndBranchInfo : RecipeOrBranchInfo[] =
    msgExpRecipeCollection.recipes.map(
      (recipe : NimbusRecipe) => recipe.getRecipeOrBranchInfos()).flat(1)


  const totalExperiments = msgExpRecipeCollection.recipes.length
  const shownExperiments = '?'
  const hiddenExperiments = '?'

  return (
    <div>
      <div>
        <h4 className="scroll-m-20 text-3xl font-semibold text-center py-4">
          Skylight
        </h4>

        <ul className="list-disc mx-20 text-sm">
          <li>
            To make the preview URLs work: load <code>about:config</code> in Firefox, and set <code>browser.newtabpage.activity-stream.asrouter.devtoolsEnabled</code> to <code>true</code>
          </li>

          <li>
          Feedback of all kinds accepted in <Link href="https://mozilla.slack.com/archives/C05N15KHCLC">#skylight-messaging-system</Link>
          </li>
        </ul>
      </div>

      <h5 className="scroll-m-20 text-xl font-semibold text-center py-4">
        123 in-tree Production ASRouter messages
      </h5>

      <div className="container mx-auto py-10">
        <MessageTable columns={fxmsMessageColumns} data={localData} />
      </div>

      <h5 className="scroll-m-20 text-xl font-semibold text-center py-4">
        Live Desktop Messaging Experiments:&nbsp;
          {totalExperiments} total: {shownExperiments} shown; {hiddenExperiments} hidden (not yet supported)
      </h5>

      <div className="container mx-auto py-10">
        <MessageTable columns={experimentColumns} data={experimentAndBranchInfo} />
      </div>
    </div>
  );
}
