import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects, getProject } from "@/lib/data";
import { getCaseStudy } from "@/lib/work";
import CaseStudyView from "@/components/work/CaseStudyView";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const project = getProject(params.slug);
  if (!project) return {};
  return {
    title: `${project.title} — Work`,
    description: project.description,
    openGraph: {
      title: `${project.title} — Zakariya Sayed`,
      description: project.description,
    },
  };
}

export default function WorkDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = getProject(params.slug);
  const study = getCaseStudy(params.slug);
  if (!project || !study) notFound();

  const index = projects.findIndex((p) => p.slug === params.slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <CaseStudyView project={project} study={study} index={index} next={next} />
  );
}
