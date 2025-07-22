import React from 'react';

// This layout file prevents loading bubbling up to the parent route
export default function QuizModeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
