# AI Receptionist Response Intelligence v2.0

## Before

Classification, retrieval, drafting, and qualification were combined in one adapter. Unknown
questions commonly became an empty deferral to a Regulus team member.

## After

Visitor: “What does Regulus do?”

> Regulus Automation Inc. identifies avoidable operational loss, quantifies it, and helps recover
> persistent value.
>
> Regulus works with Ontario service businesses—medical and dental clinics and
> professional-services firms—that want to recover missed leads and improve appointment follow-up
> with evidence-first automation.
>
> What industry does your business operate in?

Visitor: “How much do you charge?”

> A first fit review is free. If a deeper audit is useful, we scope a CAD $500 Automation
> Opportunity Audit and agree it with you before any work begins.
>
> Any pricing beyond the free fit review and the CAD $500 audit is confirmed by a Regulus team
> member for your specific situation.
>
> What industry does your business operate in?

## Pipeline

`sanitize → memory → intent → retrieval → goal → response plan → draft → quality → sales → evidence → progress → action policy → reply`

Every intelligence stage is pure and independently tested. The action layer remains deterministic:
models propose; application gates decide; durable provider evidence is still required for booking.

## Conversation strategy v2.1

One explicit primary goal is selected before drafting. Safety and explicit requests take priority,
direct questions remain `answer_question`, ambiguity becomes `clarify_request`, and qualification
advances only the earliest relevant missing distinction. Booking is blocked until a meaningful
workflow/problem or equivalent relevance is known.

The persisted turn evidence includes the selected goal, reason, confidence, blocked goals, required
known fields, expected state change, full response plan, and conversation-progress score.

## Evaluation thresholds

- Quality: at least 6/7 checks.
- Sales: at least 5/6 checks.
- Evidence: 5/5 checks, including exact approved-composition validation.
- Failure: regenerate once from deterministic approved fragments; if that still fails, return a
  safe grounded response and record `response_evaluation_failed`.

## Performance design

The deterministic path adds only local regular-expression classification, bounded-array retrieval,
and three small scoring passes. It adds no network request. The configured Anthropic path retains
one model request; evaluation and deterministic regeneration happen locally.
