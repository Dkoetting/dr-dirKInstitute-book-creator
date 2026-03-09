/**
 * jobStore.js - In-Memory-Speicher fuer Upload-Jobs
 */

/** @type {Map<string, { jobId: string, files: import('express').Request['files'], createdAt: number, meta?: Record<string, any> }>} */
const jobs = new Map();

function createJob(jobId, files) {
  jobs.set(jobId, { jobId, files, createdAt: Date.now() });
}

function getJob(jobId) {
  return jobs.get(jobId) ?? null;
}

function setJobMeta(jobId, meta) {
  const job = jobs.get(jobId);
  if (!job) return false;
  job.meta = { ...(job.meta || {}), ...(meta || {}) };
  jobs.set(jobId, job);
  return true;
}

function pruneOldJobs(maxAgeMs = 60 * 60 * 1000) {
  const cutoff = Date.now() - maxAgeMs;
  for (const [id, job] of jobs.entries()) {
    if (job.createdAt < cutoff) jobs.delete(id);
  }
}

module.exports = { createJob, getJob, setJobMeta, pruneOldJobs };
