import Link from "next/link";
import { CheckCircle2, Circle, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OFFER_FLOW_STEPS, type OfferFlowStep } from "@/lib/offer-flow";
import { cn } from "@/lib/utils";

type FlowDictionary = {
  title: string;
  complete: string;
  current: string;
  available: string;
  locked: string;
  nextStep: string;
  back: string;
  steps: Record<OfferFlowStep, string>;
  descriptions: Record<OfferFlowStep, string>;
};

const STEP_PATH: Record<OfferFlowStep, string> = {
  overview: "overview",
  "material-prices": "material-prices",
  "scopes-lines": "scopes-lines",
  calculation: "calculation",
  "review-export": "review",
};

function getStepEnabled(step: OfferFlowStep, completed: Record<OfferFlowStep, boolean>) {
  if (step === "overview" || step === "material-prices" || step === "scopes-lines") {
    return true;
  }

  if (step === "calculation") {
    return completed["material-prices"] && completed["scopes-lines"];
  }

  return completed.calculation;
}

export function OfferFlowProgress({
  offerId,
  currentStep,
  completed,
  dictionary,
}: {
  offerId: string;
  currentStep: OfferFlowStep;
  completed: Record<OfferFlowStep, boolean>;
  dictionary: FlowDictionary;
}) {
  const stepIndex = OFFER_FLOW_STEPS.indexOf(currentStep);
  const prevStep = stepIndex > 0 ? OFFER_FLOW_STEPS[stepIndex - 1] : null;
  const nextStep = stepIndex < OFFER_FLOW_STEPS.length - 1 ? OFFER_FLOW_STEPS[stepIndex + 1] : null;
  const nextStepEnabled = nextStep ? getStepEnabled(nextStep, completed) : false;

  return (
    <Card className="border-primary/10 bg-gradient-to-br from-card via-card to-muted/30 shadow-sm">
      <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>{dictionary.title}</CardTitle>
        <div className="flex gap-2">
          <Button
            nativeButton={false}
            variant="outline"
            disabled={!prevStep}
            render={<Link href={prevStep ? `/offers/${offerId}/${STEP_PATH[prevStep]}` : "#"} />}
          >
            {dictionary.back}
          </Button>
          <Button
            nativeButton={false}
            disabled={!nextStep || !nextStepEnabled}
            render={<Link href={nextStep ? `/offers/${offerId}/${STEP_PATH[nextStep]}` : "#"} />}
          >
            {dictionary.nextStep}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-3 md:grid-cols-5">
          {OFFER_FLOW_STEPS.map((step, index) => {
            const enabled = getStepEnabled(step, completed);
            const isCurrent = step === currentStep;
            const status = isCurrent
              ? dictionary.current
              : completed[step]
                ? dictionary.complete
                : enabled
                  ? dictionary.available
                  : dictionary.locked;
            const Icon = completed[step] ? CheckCircle2 : enabled ? Circle : LockKeyhole;
            const content = (
              <>
                <div className="flex min-w-0 items-start gap-3 md:block md:space-y-3">
                  <div
                    className={cn(
                      "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border text-xs font-medium md:mt-0",
                      completed[step] && "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
                      isCurrent && !completed[step] && "border-primary bg-primary text-primary-foreground",
                      enabled && !isCurrent && !completed[step] && "border-border bg-background text-muted-foreground",
                      !enabled && "border-border bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="truncate font-medium">
                      {index + 1}. {dictionary.steps[step]}
                    </div>
                    <div className="text-xs leading-5 text-muted-foreground md:min-h-10">
                      {dictionary.descriptions[step]}
                    </div>
                  </div>
                </div>
                <div
                  className={cn(
                    "shrink-0 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground md:mt-3 md:self-start",
                    isCurrent && "bg-primary/10 text-primary",
                    completed[step] && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  )}
                >
                  {status}
                </div>
              </>
            );

            return (
              <li key={step}>
                {enabled ? (
                  <Link
                    href={`/offers/${offerId}/${STEP_PATH[step]}`}
                    aria-current={isCurrent ? "page" : undefined}
                    className={cn(
                      "flex h-full items-start justify-between gap-3 rounded-xl border bg-background/70 p-3 text-sm transition hover:border-primary/30 hover:bg-muted/60 md:flex-col",
                      isCurrent && "border-primary/50 bg-primary/5 shadow-sm"
                    )}
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="flex h-full items-start justify-between gap-3 rounded-xl border bg-muted/30 p-3 text-sm opacity-70 md:flex-col">
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
