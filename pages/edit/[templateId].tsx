import { useRouter } from "next/router";
import React from "react";

export default function EditTemplate() {
  const router = useRouter();
  const { templateId } = router.query;
  return <div>{templateId}</div>;
}
