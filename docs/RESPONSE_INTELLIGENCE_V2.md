# AI Receptionist Response Intelligence v2.0

## Before

Classification, retrieval, drafting, and qualification were combined in one adapter. Unknown
questions commonly became an empty deferral to a Regulus team member.

## After

Visitor: “What does Regulus do?”

> Regulus Automation Inc. is the larger institution building operational intelligence, products,
> discovery, and research. Regulus Business Systems is its practical commercial implementation
> department for growing businesses.
>
> Regulus Business Systems initially focuses on home-service businesses, with professional
> services, clinics, and aesthetic businesses as expansion markets.
>
> What industry does your business operate in?

Visitor: “How much do you charge?”

> The Free Time & Workflow Recovery Audit is CAD $0. Optional implementation is typically
> CAD $2,500–$5,000.
>
> Optional ongoing management is typically CAD $750–$1,500 per month. These are typical ranges,
> not fixed commitments or guarantees.
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
