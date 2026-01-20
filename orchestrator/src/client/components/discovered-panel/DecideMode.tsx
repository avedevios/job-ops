import React, { useMemo, useState } from "react";
import { Calendar, DollarSign, ExternalLink, Loader2, MapPin, Sparkles, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { FitAssessment } from "../FitAssessment";
import { formatDate } from "../../lib/dateUtils";
import type { Job } from "../../../shared/types";
import { CollapsibleSection } from "./CollapsibleSection";
import { getPlainDescription, sourceLabel } from "./helpers";

interface DecideModeProps {
  job: Job;
  onTailor: () => void;
  onSkip: () => void;
  isSkipping: boolean;
}

export const DecideMode: React.FC<DecideModeProps> = ({
  job,
  onTailor,
  onSkip,
  isSkipping,
}) => {
  const [showDescription, setShowDescription] = useState(false);
  const deadline = formatDate(job.deadline);
  const jobLink = job.applicationLink || job.jobUrl;

  const description = useMemo(
    () => getPlainDescription(job.jobDescription),
    [job.jobDescription]
  );

  return (
    <div className='flex flex-col h-full'>
      <div className='space-y-3 pb-4'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0 flex-1'>
            <h2 className='text-base font-semibold text-foreground/90 leading-tight'>
              {job.title}
            </h2>
            <p className='text-sm text-muted-foreground mt-0.5'>{job.employer}</p>
          </div>

          <div className='flex flex-col items-center justify-center'>
            <Badge
              variant='outline'
              className='text-[10px] uppercase tracking-wide text-muted-foreground border-border/50 shrink-0'
            >
              {sourceLabel[job.source]}
            </Badge>
          </div>
        </div>

        {(job.location || deadline || job.salary) && (
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground/80 justify-between'>
            {job.location && (
              <span className='flex items-center gap-1'>
                <MapPin className='h-3 w-3' />
                {job.location}
              </span>
            )}
            {deadline && (
              <span className='flex items-center gap-1'>
                <Calendar className='h-3 w-3' />
                {deadline}
              </span>
            )}
            {job.salary && (
              <span className='flex items-center gap-1'>
                <DollarSign className='h-3 w-3' />
                {job.salary}
              </span>
            )}
          </div>
        )}

        <div className='flex flex-col gap-2 pt-2 sm:flex-row'>
          <Button
            variant='outline'
            size='default'
            onClick={onSkip}
            disabled={isSkipping}
            className='flex-1 h-11 text-sm text-muted-foreground hover:text-foreground hover:border-rose-500/30 hover:bg-rose-500/5 sm:h-10 sm:text-xs'
          >
            {isSkipping ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <XCircle className='mr-2 h-4 w-4' />
            )}
            Skip
          </Button>
          <Button
            size='default'
            onClick={onTailor}
            className='flex-1 h-11 text-sm bg-primary/90 hover:bg-primary sm:h-10 sm:text-xs'
          >
            <Sparkles className='mr-2 h-4 w-4' />
            Tailor
          </Button>
        </div>
      </div>

      <Separator className='opacity-50' />

      <div className='flex-1 py-4 space-y-4 overflow-y-auto'>
        <FitAssessment job={job} />

        <CollapsibleSection
          isOpen={showDescription}
          onToggle={() => setShowDescription((prev) => !prev)}
          label={`${showDescription ? "Hide" : "View"} full job description`}
        >
          <div className='rounded-lg border border-border/40 bg-muted/5 p-3 max-h-[300px] overflow-y-auto'>
            <p className='text-xs text-muted-foreground/80 whitespace-pre-wrap leading-relaxed'>
              {description}
            </p>
          </div>
        </CollapsibleSection>
      </div>

      <Separator className='opacity-50' />

      <div className='pt-4 pb-2'>
        {jobLink ? (
          <div className='flex justify-center'>
            <a
              href={jobLink}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors'
            >
              <ExternalLink className='h-3 w-3' />
              View original listing
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
};
