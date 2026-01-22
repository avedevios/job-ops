import React from "react"
import { useFormContext, Controller } from "react-hook-form"

import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { UpdateSettingsInput } from "@shared/settings-schema"
import type { JobspyValues } from "@client/pages/settings/types"
import { SettingsInput } from "@client/pages/settings/components/SettingsInput"

type JobspySectionProps = {
  values: JobspyValues
  isLoading: boolean
  isSaving: boolean
}

export const JobspySection: React.FC<JobspySectionProps> = ({
  values,
  isLoading,
  isSaving,
}) => {
  const {
    sites,
    location,
    resultsWanted,
    hoursOld,
    countryIndeed,
    linkedinFetchDescription,
  } = values
  const { control, register, formState: { errors } } = useFormContext<UpdateSettingsInput>()

  return (
    <AccordionItem value="jobspy" className="border rounded-lg px-4">
      <AccordionTrigger className="hover:no-underline py-4">
        <span className="text-base font-semibold">JobSpy Scraper</span>
      </AccordionTrigger>
      <AccordionContent className="pb-4">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="text-sm font-medium">Scraped Sites</div>
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Controller
                  name="jobspySites"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="site-indeed"
                      checked={field.value?.includes('indeed') ?? sites.default.includes('indeed')}
                      onCheckedChange={(checked) => {
                        const current = field.value ?? sites.default
                        let next = [...current]
                        if (checked) {
                          if (!next.includes('indeed')) next.push('indeed')
                        } else {
                          next = next.filter(s => s !== 'indeed')
                        }
                        field.onChange(next)
                      }}
                      disabled={isLoading || isSaving}
                    />
                  )}
                />
                <label htmlFor="site-indeed" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Indeed</label>
              </div>
              <div className="flex items-center space-x-2">
                <Controller
                  name="jobspySites"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="site-linkedin"
                      checked={field.value?.includes('linkedin') ?? sites.default.includes('linkedin')}
                      onCheckedChange={(checked) => {
                        const current = field.value ?? sites.default
                        let next = [...current]
                        if (checked) {
                          if (!next.includes('linkedin')) next.push('linkedin')
                        } else {
                          next = next.filter(s => s !== 'linkedin')
                        }
                        field.onChange(next)
                      }}
                      disabled={isLoading || isSaving}
                    />
                  )}
                />
                <label htmlFor="site-linkedin" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">LinkedIn</label>
              </div>
            </div>
            {errors.jobspySites && <p className="text-xs text-destructive">{errors.jobspySites.message}</p>}
            <div className="text-xs text-muted-foreground">
              Select which sites JobSpy should scrape.
            </div>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>Effective: {(sites.effective || []).join(', ') || "None"}</span>
              <span>Default: {(sites.default || []).join(', ')}</span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <SettingsInput
              label="Location"
              inputProps={register("jobspyLocation")}
              placeholder={location.default || "UK"}
              disabled={isLoading || isSaving}
              error={errors.jobspyLocation?.message as string | undefined}
              helper={'Location to search for jobs (e.g. "UK", "London", "Remote").'}
              current={`Effective: ${location.effective || "—"} | Default: ${location.default || "—"}`}
            />

            <Controller
              name="jobspyResultsWanted"
              control={control}
              render={({ field }) => (
                <SettingsInput
                  label="Results Wanted"
                  type="number"
                  inputProps={{
                    ...field,
                    inputMode: "numeric",
                    min: 1,
                    max: 1000,
                    value: field.value ?? resultsWanted.default,
                    onChange: (event) => {
                      const value = parseInt(event.target.value, 10)
                      if (Number.isNaN(value)) {
                        field.onChange(null)
                      } else {
                        field.onChange(Math.min(1000, Math.max(1, value)))
                      }
                    },
                  }}
                  disabled={isLoading || isSaving}
                  error={errors.jobspyResultsWanted?.message as string | undefined}
                  helper={`Number of results to fetch per term per site. Default: ${resultsWanted.default}. Max 1000.`}
                  current={`Effective: ${resultsWanted.effective} | Default: ${resultsWanted.default}`}
                />
              )}
            />

            <Controller
              name="jobspyHoursOld"
              control={control}
              render={({ field }) => (
                <SettingsInput
                  label="Hours Old"
                  type="number"
                  inputProps={{
                    ...field,
                    inputMode: "numeric",
                    min: 1,
                    max: 720,
                    value: field.value ?? hoursOld.default,
                    onChange: (event) => {
                      const value = parseInt(event.target.value, 10)
                      if (Number.isNaN(value)) {
                        field.onChange(null)
                      } else {
                        field.onChange(Math.min(720, Math.max(1, value)))
                      }
                    },
                  }}
                  disabled={isLoading || isSaving}
                  error={errors.jobspyHoursOld?.message as string | undefined}
                  helper={`Max age of jobs in hours (e.g. 72 for 3 days). Default: ${hoursOld.default}. Max 720.`}
                  current={`Effective: ${hoursOld.effective}h | Default: ${hoursOld.default}h`}
                />
              )}
            />

            <SettingsInput
              label="Indeed Country"
              inputProps={register("jobspyCountryIndeed")}
              placeholder={countryIndeed.default || "UK"}
              disabled={isLoading || isSaving}
              error={errors.jobspyCountryIndeed?.message as string | undefined}
              helper={'Country domain for Indeed (e.g. "UK" for indeed.co.uk).'}
              current={`Effective: ${countryIndeed.effective || "—"} | Default: ${countryIndeed.default || "—"}`}
            />
          </div>

          <Separator />

          <div className="flex items-center space-x-2">
            <Controller
              name="jobspyLinkedinFetchDescription"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="linkedin-desc"
                  checked={field.value ?? linkedinFetchDescription.default}
                  onCheckedChange={(checked) => field.onChange(!!checked)}
                  disabled={isLoading || isSaving}
                />
              )}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="linkedin-desc"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Fetch LinkedIn Description
              </label>
              <p className="text-xs text-muted-foreground">
                If enabled, JobSpy will make extra requests to fetch full descriptions. Slower but better data.
              </p>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>Effective: {linkedinFetchDescription.effective ? "Yes" : "No"}</span>
                <span>Default: {linkedinFetchDescription.default ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
