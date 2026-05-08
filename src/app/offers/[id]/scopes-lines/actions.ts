"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  addLineToOfferScope,
  addPartToLine,
  addScopeToOffer,
  removeLineFromOfferScope,
  removePartFromLine,
  removeScopeFromOffer,
  updateLinePartQuantity,
  updateOfferLine,
} from "@/lib/scopes-lines";

function redirectWithError(offerId: string, message: string) {
  redirect(
    `/offers/${offerId}/scopes-lines?error=${encodeURIComponent(message)}`
  );
}

export async function addScopeAction(offerId: string, formData: FormData) {
  const scopeId = String(formData.get("scope_id") ?? "");
  const result = await addScopeToOffer(offerId, scopeId);

  if (result.error) {
    redirectWithError(offerId, result.error);
  }

  revalidatePath(`/offers/${offerId}/scopes-lines`);
  redirect(`/offers/${offerId}/scopes-lines`);
}

export async function addLineAction(offerId: string, formData: FormData) {
  const offerScopeId = String(formData.get("offer_scope_id") ?? "");
  const lineName = String(formData.get("line_name") ?? "");
  const result = await addLineToOfferScope(offerId, offerScopeId, lineName);

  if (result.error) {
    redirectWithError(offerId, result.error);
  }

  revalidatePath(`/offers/${offerId}/scopes-lines`);
  redirect(`/offers/${offerId}/scopes-lines`);
}

export async function addPartAction(offerId: string, formData: FormData) {
  const offerScopeId = String(formData.get("offer_scope_id") ?? "");
  const lineId = String(formData.get("line_id") ?? "");
  const partId = String(formData.get("part_id") ?? "");
  const qty = Number(formData.get("qty"));
  const result = await addPartToLine(offerId, offerScopeId, lineId, partId, qty);

  if (result.error) {
    redirectWithError(offerId, result.error);
  }

  revalidatePath(`/offers/${offerId}/scopes-lines`);
  redirect(`/offers/${offerId}/scopes-lines`);
}

export async function removeScopeAction(offerId: string, formData: FormData) {
  const offerScopeId = String(formData.get("offer_scope_id") ?? "");
  const result = await removeScopeFromOffer(offerId, offerScopeId);

  if (result.error) {
    redirectWithError(offerId, result.error);
  }

  revalidatePath(`/offers/${offerId}/scopes-lines`);
  redirect(`/offers/${offerId}/scopes-lines`);
}

export async function updateLineAction(offerId: string, formData: FormData) {
  const offerScopeId = String(formData.get("offer_scope_id") ?? "");
  const lineId = String(formData.get("line_id") ?? "");
  const lineName = String(formData.get("line_name") ?? "");
  const result = await updateOfferLine(offerId, offerScopeId, lineId, lineName);

  if (result.error) {
    redirectWithError(offerId, result.error);
  }

  revalidatePath(`/offers/${offerId}/scopes-lines`);
  redirect(`/offers/${offerId}/scopes-lines`);
}

export async function removeLineAction(offerId: string, formData: FormData) {
  const offerScopeId = String(formData.get("offer_scope_id") ?? "");
  const lineId = String(formData.get("line_id") ?? "");
  const result = await removeLineFromOfferScope(offerId, offerScopeId, lineId);

  if (result.error) {
    redirectWithError(offerId, result.error);
  }

  revalidatePath(`/offers/${offerId}/scopes-lines`);
  redirect(`/offers/${offerId}/scopes-lines`);
}

export async function updateLinePartQtyAction(offerId: string, formData: FormData) {
  const offerScopeId = String(formData.get("offer_scope_id") ?? "");
  const lineId = String(formData.get("line_id") ?? "");
  const linePartId = String(formData.get("line_part_id") ?? "");
  const qty = Number(formData.get("qty"));
  const result = await updateLinePartQuantity(offerId, offerScopeId, lineId, linePartId, qty);

  if (result.error) {
    redirectWithError(offerId, result.error);
  }

  revalidatePath(`/offers/${offerId}/scopes-lines`);
  redirect(`/offers/${offerId}/scopes-lines`);
}

export async function removeLinePartAction(offerId: string, formData: FormData) {
  const offerScopeId = String(formData.get("offer_scope_id") ?? "");
  const lineId = String(formData.get("line_id") ?? "");
  const linePartId = String(formData.get("line_part_id") ?? "");
  const result = await removePartFromLine(offerId, offerScopeId, lineId, linePartId);

  if (result.error) {
    redirectWithError(offerId, result.error);
  }

  revalidatePath(`/offers/${offerId}/scopes-lines`);
  redirect(`/offers/${offerId}/scopes-lines`);
}
