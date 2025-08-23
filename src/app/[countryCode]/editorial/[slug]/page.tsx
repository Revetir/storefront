import React from "react";
import { notFound } from "next/navigation";
import { editorials, Editorial } from "@/lib/data/editorials";

interface EditorialPageProps {
  params: { slug: string };
}

export default function EditorialPage({ params }: EditorialPageProps) {
  const article = editorials.find((e: Editorial) => e.slug === params.slug);
  if (!article) return notFound();

  return (
    <article className="prose mx-auto py-12">
      <h1 className="text-6xl text-left pl-4 mb-4 uppercase">{article.title}</h1>
      {article.subtitle && (
        <h2 className="text-2xl text-left pl-4 mb-4 font-normal text-gray-700">{article.subtitle}</h2>
      )}
      <p className="text-xs text-left pl-4 mb-6">
        <span className="font-normal">By: </span>
        <span className="font-bold">{article.author}</span>
        <span className="font-normal"> | {article.date}</span>
      </p>
      {article.image && (
        <img src={article.image} alt={article.title} className="rounded-md my-6 mx-auto block" />
      )}
      <div dangerouslySetInnerHTML={{ __html: article.content }} />
      {/* You can extend this to render other media types as needed */}
    </article>
  );
} 