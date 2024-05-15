"use client"
import { types } from "@mozilla/nimbus-shared";
import { ColumnDef } from "@tanstack/react-table";
import { Button, buttonVariants } from "@/components/ui/button";
import { NimbusRecipe } from "@/lib/nimbusRecipe";
import { PreviewLinkButton } from "@/components/ui/previewlinkbutton";
import { Copy } from "lucide-react";
import { PrettyDateRange } from "./dates";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function OffsiteLink(href: string, linkText: string) {
  return (
    <a href={href} className="text-xs/[180%] whitespace-nowrap" target="_blank" rel="noreferrer">
      {linkText}
      <svg
        fill="none"
        viewBox="0 0 8 8"
        className="inline h-[1.1rem] w-[1.1rem] px-1"
        aria-hidden="true"
      >
        <path
          clipRule="evenodd"
          d="m1.71278 0h.57093c.31531 0 .57092.255837.57092.571429 0 .315591-.25561.571431-.57092.571431h-.57093c-.31531 0-.57093.25583-.57093.57143v4.57142c0 .3156.25562.57143.57093.57143h4.56741c.31531 0 .57093-.25583.57093-.57143v-.57142c0-.3156.25561-.57143.57092-.57143.31532 0 .57093.25583.57093.57143v.57142c0 .94678-.76684 1.71429-1.71278 1.71429h-4.56741c-.945943 0-1.71278-.76751-1.71278-1.71429v-4.57142c0-.946778.766837-1.71429 1.71278-1.71429zm5.71629 0c.23083.0002686.43879.13963.52697.353143.02881.069172.04375.143342.04396.218286v2.857141c0 .31559-.25561.57143-.57093.57143-.31531 0-.57092-.25584-.57092-.57143v-1.47771l-1.88006 1.88171c-.14335.14855-.35562.20812-.55523.15583-.19962-.0523-.35551-.20832-.40775-.40811-.05225-.19979.00727-.41225.15569-.55572l1.88006-1.88171h-1.47642c-.31531 0-.57093-.25584-.57093-.571431 0-.315592.25562-.571429.57093-.571429z"
          fill="#5e5e72"
          fillRule="evenodd"
        ></path>
      </svg>
    </a>
  );
}

// This type is used to define the shape of our data.
export type FxMSMessageInfo = {
  product: 'Desktop' | 'Android'
  id: string
  template: string
  surface: string
  segment: string
  ctrPercent: number
  ctrPercentChange: number
  ctrDashboardLink?: string
  previewLink?: string
  metrics: string
}

type NimbusExperiment = types.experiments.NimbusExperiment;

export type RecipeInfo = {
  product: 'Desktop' | 'Android'
  id: string
  template?: string
  surface?: string
  segment?: string
  ctrPercent?: number
  ctrPercentChange?: number
  ctrDashboardLink?: string
  previewLink?: string
  metrics?: string
  experimenterLink?: string
  startDate: string | null
  endDate: string | null
  userFacingName?: string
  nimbusExperiment: NimbusExperiment
  isBranch?: boolean
} | []

export type BranchInfo = {
  product: 'Desktop' | 'Android'
  id: string
  slug: string
  surface?: string
  segment?: string
  ctrPercent?: number
  ctrPercentChange?: number
  ctrDashboardLink?: string
  previewLink?: string
  metrics?: string
  experimenterLink?: string
  startDate?: string
  endDate?: string
  userFacingName?: string
  nimbusExperiment: NimbusExperiment
  isBranch?: boolean
  template?: string
  screenshots?: string[]
  description?: string
} | []

export type RecipeOrBranchInfo = RecipeInfo | BranchInfo;

export const fxmsMessageColumns: ColumnDef<FxMSMessageInfo>[] = [
  {
    accessorKey: "id",
    header: "Message ID",
    cell: (props: any) => {
      return <div className="font-mono text-xs">{props.row.original.id}</div>
    }
  },
  {
    accessorKey: "surface",
    header: "Surface",
    cell: (props: any) => {
      return <div className="text-xs/[180%]">{props.row.original.surface}</div>
    }
  }, {
  //   accessorKey: "segment",
  //   header: "Segment",
  // }, {
    accessorKey: "metrics",
    header: "Metrics",
    cell: (props: any) => {

      // XXX these dashboards are currently (incorrectly) empty.
      // Until we debug and fix, we'll hide them.
      //
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1889497
      const hideDashboardMessages = [
        "PDFJS_FEATURE_TOUR_A",
        "PDFJS_FEATURE_TOUR_B",
        "FIREFOX_VIEW_SPOTLIGHT",
      ]
      if (hideDashboardMessages.includes(
          props.row.original.id)) {
        return ( <></> );
      }

      if (props.row.original.ctrDashboardLink) {
        return OffsiteLink(props.row.original.ctrDashboardLink, "Dashboard");
      }
      return ( <></> );
    }
  }, {
    accessorKey: "previewLink",
    header: "",
    cell: (props: any) => {
      if (props.row.original.template !== 'infobar'
          && props.row.original.template !== 'spotlight') {
          return ( <div/> );
      }

      return (
        <PreviewLinkButton previewLink={props.row.original.previewLink} />
      )
    }
  },
]

export const experimentColumns: ColumnDef<RecipeOrBranchInfo>[] = [
  {
    accessorKey: "dates",
    header: "Dates",
    cell: (props: any) => {
      return (
        <PrettyDateRange startDate={props.row.original.startDate}
          endDate={props.row.original.endDate} />
      );
    }
  },
  {
    accessorKey: "exp_or_branch",
    header: "",
    cell: (props: any) => {
      if (props.row.original.userFacingName) {
        return (
          <>
            <a href={props.row.original.experimenterLink} className="font-semibold text-sm text-primary visited:text-inherit hover:text-blue-800 no-underline" target="_blank" rel="noreferrer">
              {props.row.original.userFacingName || props.row.original.id}
            </a>
            <div className="font-mono text-3xs">
              {props.row.original.id}
            </div>
          </>
        );
      }

      const recipe = new NimbusRecipe(props.row.original.nimbusExperiment)

      return (
          <div className="ps-6">
            <a href={recipe.getBranchRecipeLink(props.row.original.slug)} className="text-xs text-primary visited:text-inherit hover:text-blue-800 no-underline" target="_blank" rel="noreferrer">
              {props.row.original.description || props.row.original.id}
            </a>
            <p className="font-mono text-3xs">
              {props.row.original.slug}
            </p>
          </div>
          
      );
    }
  },
  {
    accessorKey: "surface",
    header: "Surface",
    cell: (props: any) => {
      return <div className="text-xs/[180%]">{props.row.original.surface}</div>
    }
  }, {
  //   accessorKey: "segment",
  //   header: "Segment",
  // }, {
    accessorKey: "metrics",
    header: "Metrics",
    cell: (props: any) => {

      // XXX these dashboards are currently (incorrectly) empty.
      // Until we fix the upcase bug, we'll hide them
      const hideDashboardExperiments = [
        "recommend-media-addons-feature-existing-users",
        "recommend-media-addons-feature-callout"
      ]
      if (hideDashboardExperiments.includes(props.row.original?.nimbusExperiment?.slug)) {
        return ( <></> );
      }


      // XXX see https://bugzilla.mozilla.org/show_bug.cgi?id=1890055 for
      // re-enabling infobar code.
      if (props.row.original.ctrDashboardLink) {
        return OffsiteLink(props.row.original.ctrDashboardLink, "Dashboard");
      }
      return ( <></> );
    }
  }, {
    accessorKey: "other",
    header: "",
    cell: (props: any) => {
      if (props.row.original.experimenterLink) {
        return (
          OffsiteLink(props.row.original.experimenterLink, "Experiment")
        );
      }

      if (props.row.original.previewLink == undefined) {
        // XXX should figure out how to do this NimbusRecipe instantiation
        // once per row (maybe useState?)
        const recipe = new NimbusRecipe(props.row.original.nimbusExperiment)
        
        if (props.row.original.screenshots.length > 0) {
          const branchLink = recipe.getBranchScreenshotsLink(props.row.original.slug)
          return OffsiteLink(branchLink, "Screenshots")
        } else {
          return null
        }
      }

      return (
        <PreviewLinkButton previewLink={props.row.original.previewLink} />
      );
    }
  },
]
