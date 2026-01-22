import { Router, Request, Response } from 'express';
import { updateSettingsSchema } from '@shared/settings-schema.js';
import * as settingsRepo from '@server/repositories/settings.js';
import {
  applyEnvValue,
  normalizeEnvInput,
} from '@server/services/envSettings.js';
import {
  extractProjectsFromProfile,
  normalizeResumeProjectsSettings,
} from '@server/services/resumeProjects.js';
import { getProfile } from '@server/services/profile.js';
import { getEffectiveSettings } from '@server/services/settings.js';

export const settingsRouter = Router();

/**
 * GET /api/settings - Get app settings (effective + defaults)
 */
settingsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const data = await getEffectiveSettings();
    res.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

/**
 * PATCH /api/settings - Update settings overrides
 */
settingsRouter.patch('/', async (req: Request, res: Response) => {
  try {
    const input = updateSettingsSchema.parse(req.body);

    if ('model' in input) {
      const model = input.model ?? null;
      await settingsRepo.setSetting('model', model);
    }

    if ('modelScorer' in input) {
      await settingsRepo.setSetting('modelScorer', input.modelScorer ?? null);
    }
    if ('modelTailoring' in input) {
      await settingsRepo.setSetting('modelTailoring', input.modelTailoring ?? null);
    }
    if ('modelProjectSelection' in input) {
      await settingsRepo.setSetting('modelProjectSelection', input.modelProjectSelection ?? null);
    }

    if ('pipelineWebhookUrl' in input) {
      const pipelineWebhookUrl = input.pipelineWebhookUrl ?? null;
      await settingsRepo.setSetting('pipelineWebhookUrl', pipelineWebhookUrl);
    }

    if ('jobCompleteWebhookUrl' in input) {
      const webhookUrl = input.jobCompleteWebhookUrl ?? null;
      await settingsRepo.setSetting('jobCompleteWebhookUrl', webhookUrl);
    }

    if ('resumeProjects' in input) {
      const resumeProjects = input.resumeProjects ?? null;

      if (resumeProjects === null) {
        await settingsRepo.setSetting('resumeProjects', null);
      } else {
        const rawProfile = await getProfile();

        if (rawProfile === null || typeof rawProfile !== 'object' || Array.isArray(rawProfile)) {
          throw new Error('Invalid resume profile format: expected a non-null object');
        }

        const profile = rawProfile as Record<string, unknown>;
        const { catalog } = extractProjectsFromProfile(profile);
        const allowed = new Set(catalog.map((p) => p.id));
        const normalized = normalizeResumeProjectsSettings(resumeProjects, allowed);
        await settingsRepo.setSetting('resumeProjects', JSON.stringify(normalized));
      }
    }

    if ('ukvisajobsMaxJobs' in input) {
      const ukvisajobsMaxJobs = input.ukvisajobsMaxJobs ?? null;
      await settingsRepo.setSetting('ukvisajobsMaxJobs', ukvisajobsMaxJobs !== null ? String(ukvisajobsMaxJobs) : null);
    }

    if ('gradcrackerMaxJobsPerTerm' in input) {
      const gradcrackerMaxJobsPerTerm = input.gradcrackerMaxJobsPerTerm ?? null;
      await settingsRepo.setSetting('gradcrackerMaxJobsPerTerm', gradcrackerMaxJobsPerTerm !== null ? String(gradcrackerMaxJobsPerTerm) : null);
    }

    if ('searchTerms' in input) {
      const searchTerms = input.searchTerms ?? null;
      await settingsRepo.setSetting('searchTerms', searchTerms !== null ? JSON.stringify(searchTerms) : null);
    }

    if ('jobspyLocation' in input) {
      const value = input.jobspyLocation ?? null;
      await settingsRepo.setSetting('jobspyLocation', value);
    }

    if ('jobspyResultsWanted' in input) {
      const value = input.jobspyResultsWanted ?? null;
      await settingsRepo.setSetting('jobspyResultsWanted', value !== null ? String(value) : null);
    }

    if ('jobspyHoursOld' in input) {
      const value = input.jobspyHoursOld ?? null;
      await settingsRepo.setSetting('jobspyHoursOld', value !== null ? String(value) : null);
    }

    if ('jobspyCountryIndeed' in input) {
      const value = input.jobspyCountryIndeed ?? null;
      await settingsRepo.setSetting('jobspyCountryIndeed', value);
    }

    if ('jobspySites' in input) {
      const value = input.jobspySites ?? null;
      await settingsRepo.setSetting('jobspySites', value !== null ? JSON.stringify(value) : null);
    }

    if ('jobspyLinkedinFetchDescription' in input) {
      const value = input.jobspyLinkedinFetchDescription ?? null;
      await settingsRepo.setSetting('jobspyLinkedinFetchDescription', value !== null ? (value ? '1' : '0') : null);
    }

    if ('showSponsorInfo' in input) {
      const value = input.showSponsorInfo ?? null;
      await settingsRepo.setSetting('showSponsorInfo', value !== null ? (value ? '1' : '0') : null);
    }

    if ('openrouterApiKey' in input) {
      const value = normalizeEnvInput(input.openrouterApiKey);
      await settingsRepo.setSetting('openrouterApiKey', value);
      applyEnvValue('OPENROUTER_API_KEY', value);
    }

    if ('rxresumeEmail' in input) {
      const value = normalizeEnvInput(input.rxresumeEmail);
      await settingsRepo.setSetting('rxresumeEmail', value);
      applyEnvValue('RXRESUME_EMAIL', value);
    }

    if ('rxresumePassword' in input) {
      const value = normalizeEnvInput(input.rxresumePassword);
      await settingsRepo.setSetting('rxresumePassword', value);
      applyEnvValue('RXRESUME_PASSWORD', value);
    }

    if ('basicAuthUser' in input) {
      const value = normalizeEnvInput(input.basicAuthUser);
      await settingsRepo.setSetting('basicAuthUser', value);
      applyEnvValue('BASIC_AUTH_USER', value);
    }

    if ('basicAuthPassword' in input) {
      const value = normalizeEnvInput(input.basicAuthPassword);
      await settingsRepo.setSetting('basicAuthPassword', value);
      applyEnvValue('BASIC_AUTH_PASSWORD', value);
    }

    if ('ukvisajobsEmail' in input) {
      const value = normalizeEnvInput(input.ukvisajobsEmail);
      await settingsRepo.setSetting('ukvisajobsEmail', value);
      applyEnvValue('UKVISAJOBS_EMAIL', value);
    }

    if ('ukvisajobsPassword' in input) {
      const value = normalizeEnvInput(input.ukvisajobsPassword);
      await settingsRepo.setSetting('ukvisajobsPassword', value);
      applyEnvValue('UKVISAJOBS_PASSWORD', value);
    }

    if ('webhookSecret' in input) {
      const value = normalizeEnvInput(input.webhookSecret);
      await settingsRepo.setSetting('webhookSecret', value);
      applyEnvValue('WEBHOOK_SECRET', value);
    }

    const data = await getEffectiveSettings();
    res.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ success: false, error: message });
  }
});
