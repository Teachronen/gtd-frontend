const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type ApiId = string;

export type Nullable<T> = T | null;

export interface ApiErrorBody {
  detail?: string;
  [key: string]: unknown;
}

export interface BaseModel {
  id: ApiId;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

/**
 * Home
 */

export interface HomeResponse {
  inbox_count: number;
  open_next_actions_count: number;
  waiting_for_due_count: number;
  stuck_projects_count: number;
  weekly_review: {
    is_due: boolean;
    status: "open" | "due" | "not_due" | string;
    current_review_id: Nullable<ApiId>;
    message: string;
  };
  cards: {
    show_weekly_review: boolean;
    show_stuck_projects: boolean;
    show_inbox_zero: boolean;
  };
}

/**
 * Core models returned by the API.
 * The backend serializers currently use fields="__all__",
 * so these types include the important known fields and allow extra fields.
 */

export interface InboxItem extends BaseModel {
  title: string;
  body: string;
  source: "user" | "system" | "email" | "share" | "import" | string;
  status: "new" | "processing" | "processed" | "trashed" | string;
  requires_action: Nullable<boolean>;
  outcome: string;
  processed_at: Nullable<string>;
  result_model: string;
  result_object_id: Nullable<ApiId>;
  system_reason: string;
  client_uuid?: Nullable<string>;
  client_created_at?: Nullable<string>;
}

export interface Context extends BaseModel {
  name: string;
  description?: string;
  icon?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface ContextSummary extends Context {
  open_next_actions_count: number;
}

export interface Person extends BaseModel {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  is_active?: boolean;
}

export interface Project extends BaseModel {
  title: string;
  desired_outcome: string;
  notes?: string;
  area?: string;
  due_at?: Nullable<string>;
  status: "active" | "completed" | "cancelled" | "someday" | "archived" | string;
  blocked: boolean;
  block_reason?: string;
  movement_status?: "moving" | "stuck" | "blocked" | "not_active" | string;
  open_next_actions_count?: number;
  open_waiting_for_count?: number;
  future_calendar_triggers_count?: number;
  support_items_count?: number;
}

export interface NextAction extends BaseModel {
  title: string;
  notes?: string;
  project?: Nullable<ApiId>;
  context: ApiId;
  person?: Nullable<ApiId>;
  status: "open" | "done" | "cancelled" | string;
  energy?: string;
  estimated_minutes?: Nullable<number>;
  available_from?: Nullable<string>;
  due_at?: Nullable<string>;
  hidden_until?: Nullable<string>;
  completed_at?: Nullable<string>;
  cancelled_at?: Nullable<string>;

  project_title?: string;
  context_name?: string;
  person_name?: string;
}

export interface WaitingFor extends BaseModel {
  title: string;
  notes?: string;
  person: ApiId;
  project?: Nullable<ApiId>;
  status: "open" | "done" | "cancelled" | string;
  follow_up_at?: Nullable<string>;
  completed_at?: Nullable<string>;
  cancelled_at?: Nullable<string>;

  person_name?: string;
  project_title?: string;
  is_overdue?: boolean;
}

export interface CalendarEntry extends BaseModel {
  title: string;
  notes?: string;
  entry_type:
    | "event"
    | "day_specific_action"
    | "tickler"
    | "project_trigger"
    | string;
  start_at: string;
  end_at?: Nullable<string>;
  all_day?: boolean;
  status: "active" | "done" | "cancelled" | string;
  project?: Nullable<ApiId>;

  project_title?: string;
}

export interface SomedayMaybeItem extends BaseModel {
  title: string;
  notes?: string;
  category?: string;
  status: "active" | "activated" | "dropped" | "archived" | string;
  review_at?: Nullable<string>;
  activated_project?: Nullable<ApiId>;
  activated_next_action?: Nullable<ApiId>;
  activated_at?: Nullable<string>;

  activated_project_title?: string;
  activated_next_action_title?: string;
}

export interface ReferenceItem extends BaseModel {
  title: string;
  body?: string;
  category?: string;
  url?: string;
  file?: Nullable<string>;
  project?: Nullable<ApiId>;

  project_title?: string;
}

export interface ProjectSupportItem extends BaseModel {
  project: ApiId;
  title: string;
  body?: string;
  url?: string;
  file?: Nullable<string>;

  project_title?: string;
}

export interface AgendaItem extends BaseModel {
  title: string;
  notes?: string;
  person?: Nullable<ApiId>;
  project?: Nullable<ApiId>;
  status: "open" | "discussed" | "cancelled" | string;
  discussed_at?: Nullable<string>;
  cancelled_at?: Nullable<string>;

  person_name?: string;
  project_title?: string;
}

export interface ReviewAlert extends BaseModel {
  alert_type: string;
  status: "open" | "resolved" | "dismissed" | string;
  project?: Nullable<ApiId>;
  waiting_for?: Nullable<ApiId>;
  someday_item?: Nullable<ApiId>;
  message: string;
  generated_inbox_item?: Nullable<ApiId>;
  resolved_at?: Nullable<string>;
  dismissed_at?: Nullable<string>;

  project_title?: string;
  waiting_for_title?: string;
  someday_item_title?: string;
}

export type WeeklyReviewStep =
  | "inbox_zero"
  | "calendar_past"
  | "calendar_future"
  | "projects"
  | "next_actions"
  | "waiting_for"
  | "agendas"
  | "someday_maybe";

export type WeeklyReviewStepStatus = "pending" | "done" | "skipped" | string;

export interface WeeklyReviewChecklistItem extends BaseModel {
  review: ApiId;
  step: WeeklyReviewStep | string;
  status: WeeklyReviewStepStatus;
  completed_at?: Nullable<string>;
  skipped_at?: Nullable<string>;
  notes?: string;
}

export interface WeeklyReviewSession extends BaseModel {
  status: "open" | "completed" | "cancelled" | string;
  started_at: string;
  completed_at?: Nullable<string>;
  cancelled_at?: Nullable<string>;
  notes?: string;
  inbox_items_processed_count?: number;
  next_actions_added_count?: number;
  waiting_for_reviewed_count?: number;
  stuck_projects_count_at_finish?: number;
  checklist_items?: WeeklyReviewChecklistItem[];
}

export interface CurrentWeeklyReviewEmptyResponse {
  current_review: null;
}

export interface WeeklyReviewStepResponse {
  review: WeeklyReviewSession;
  step: WeeklyReviewStep | string;
  checklist_item: {
    id: ApiId;
    status: WeeklyReviewStepStatus;
    notes: string;
  };
  items:
    | InboxItem[]
    | CalendarEntry[]
    | Project[]
    | NextAction[]
    | WaitingFor[]
    | AgendaItem[]
    | SomedayMaybeItem[];
}

/**
 * Inbox processing payloads
 */

export interface InboxDecision {
  requires_action: boolean;

  target?: string;
  action_type?: string;

  next_visible_action?: string;
  is_project?: boolean;
  two_minute?: boolean;

  title?: string;
  body?: string;
  notes?: string;
  category?: string;
  url?: string;

  project_id?: Nullable<ApiId>;
  context_id?: Nullable<ApiId>;
  person_id?: Nullable<ApiId>;

  follow_up_at?: Nullable<string>;
  start_at?: Nullable<string>;
  end_at?: Nullable<string>;
  all_day?: boolean;

  entry_type?: string;

  project_title?: string;
  desired_outcome?: string;
  initial_movement_type?: "next_action" | "waiting_for" | "calendar" | "blocked" | string;

  next_action_title?: string;
  next_action_notes?: string;

  waiting_for_title?: string;

  calendar_title?: string;

  block_reason?: string;

  estimated_minutes?: Nullable<number>;
  energy?: string;
  due_at?: Nullable<string>;
  available_from?: Nullable<string>;

  [key: string]: unknown;
}

export interface ProcessInboxItemResponse {
  status: "processed" | string;
  result_model: string;
  result_id: ApiId;
  result:
    | InboxItem
    | Project
    | NextAction
    | WaitingFor
    | CalendarEntry
    | SomedayMaybeItem
    | ReferenceItem
    | ProjectSupportItem
    | AgendaItem
    | ReviewAlert
    | BaseModel;
}

export type NotNowPayload =
  | {
      mode: "hide_today";
    }
  | {
      mode: "until";
      hidden_until: string;
    };

export interface QuickCaptureOptions {
  client_uuid?: string;
  client_created_at?: string;
}

export interface EmptyInboxResponse {
  detail: string;
  item: null;
}

export interface ProjectHealthResponse {
  project_id: ApiId;
  has_movement: boolean;
  is_stuck: boolean;
  alert: Nullable<ReviewAlert>;
}

/**
 * Internal helpers
 */

function buildUrl(
  path: string,
  query?: Record<string, string | number | boolean | null | undefined>
): string {
  const cleanBase = API_BASE_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  const url = new URL(`${cleanBase}${cleanPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie.split(";").map((cookie) => cookie.trim());

  for (const cookie of cookies) {
    if (cookie.startsWith(`${name}=`)) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }

  return null;
}

async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiErrorBody;

    if (typeof data.detail === "string") {
      return data.detail;
    }

    return JSON.stringify(data);
  } catch {
    return `API request failed: ${response.status} ${response.statusText}`;
  }
}

async function apiRequest<T>(
  path: string,
  options: {
    method?: HttpMethod;
    body?: unknown;
    query?: Record<string, string | number | boolean | null | undefined>;
  } = {}
): Promise<T> {
  const method = options.method || "GET";
  const csrfToken = getCookie("csrftoken");
  const hasBody = options.body !== undefined;

  const headers: Record<string, string> = {};

  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }

  if (csrfToken && method !== "GET") {
    headers["X-CSRFToken"] = csrfToken;
  }

  const response = await fetch(buildUrl(path, options.query), {
    method,
    headers,
    credentials: "include",
    body: hasBody ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const message = await parseErrorResponse(response);
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Home
 */

export async function getHome(): Promise<HomeResponse> {
  return apiRequest<HomeResponse>("/home/");
}

/**
 * Inbox
 */

export async function quickCapture(
  text: string,
  options: QuickCaptureOptions = {}
): Promise<InboxItem> {
  return apiRequest<InboxItem>("/inbox/quick-capture/", {
    method: "POST",
    body: {
      text,
      ...options,
    },
  });
}

export async function getInbox(params?: {
  status?: string;
  source?: string;
}): Promise<InboxItem[]> {
  return apiRequest<InboxItem[]>("/inbox/", {
    query: params,
  });
}

export async function getNextInboxItem(): Promise<InboxItem | EmptyInboxResponse> {
  return apiRequest<InboxItem | EmptyInboxResponse>("/inbox/next/");
}

export async function processInboxItem(
  id: ApiId,
  decision: InboxDecision
): Promise<ProcessInboxItemResponse> {
  return apiRequest<ProcessInboxItemResponse>(`/inbox/${id}/process/`, {
    method: "POST",
    body: decision,
  });
}

/**
 * Contexts + What Now
 */

export async function getContextSummary(): Promise<ContextSummary[]> {
  return apiRequest<ContextSummary[]>("/contexts/summary/");
}

export async function getNowActions(
  contextId?: ApiId,
  options: {
    availableMinutes?: number;
    energy?: string;
    personId?: ApiId;
  } = {}
): Promise<NextAction[]> {
  return apiRequest<NextAction[]>("/now/", {
    query: {
      context_id: contextId,
      available_minutes: options.availableMinutes,
      energy: options.energy,
      person_id: options.personId,
    },
  });
}

export async function completeNextAction(id: ApiId): Promise<NextAction> {
  return apiRequest<NextAction>(`/next-actions/${id}/complete/`, {
    method: "POST",
  });
}

export async function notNowNextAction(
  id: ApiId,
  payload: NotNowPayload = { mode: "hide_today" }
): Promise<NextAction> {
  return apiRequest<NextAction>(`/next-actions/${id}/not-now/`, {
    method: "POST",
    body: payload,
  });
}

/**
 * Projects
 */

export async function getProjects(params?: {
  status?: string;
  blocked?: boolean;
  movement?: "stuck" | string;
}): Promise<Project[]> {
  return apiRequest<Project[]>("/projects/", {
    query: {
      status: params?.status,
      blocked: params?.blocked,
      movement: params?.movement,
    },
  });
}

export async function getProject(id: ApiId): Promise<Project> {
  return apiRequest<Project>(`/projects/${id}/`);
}

export async function getStuckProjects(): Promise<Project[]> {
  return apiRequest<Project[]>("/projects/", {
    query: {
      movement: "stuck",
    },
  });
}

export async function getProjectHealth(id: ApiId): Promise<ProjectHealthResponse> {
  return apiRequest<ProjectHealthResponse>(`/projects/${id}/health/`);
}

export async function blockProject(
  id: ApiId,
  blockReason = ""
): Promise<Project> {
  return apiRequest<Project>(`/projects/${id}/block/`, {
    method: "POST",
    body: {
      block_reason: blockReason,
    },
  });
}

export async function unblockProject(id: ApiId): Promise<Project> {
  return apiRequest<Project>(`/projects/${id}/unblock/`, {
    method: "POST",
  });
}

export async function completeProject(id: ApiId): Promise<Project> {
  return apiRequest<Project>(`/projects/${id}/complete/`, {
    method: "POST",
  });
}

export async function moveProjectToSomeday(id: ApiId): Promise<Project> {
  return apiRequest<Project>(`/projects/${id}/move-to-someday/`, {
    method: "POST",
  });
}

/**
 * People
 */

export async function getPeople(): Promise<Person[]> {
  return apiRequest<Person[]>("/people/");
}

export async function getPerson(id: ApiId): Promise<Person> {
  return apiRequest<Person>(`/people/${id}/`);
}

export async function getPersonEngage(id: ApiId): Promise<{
  person: Person;
  agenda_items: AgendaItem[];
  waiting_for: WaitingFor[];
  next_actions: NextAction[];
}> {
  return apiRequest(`/people/${id}/engage/`);
}

/**
 * Waiting For
 */

export async function getWaitingFor(params?: {
  status?: string;
  personId?: ApiId;
  projectId?: ApiId;
  due?: "overdue" | "no_date" | string;
}): Promise<WaitingFor[]> {
  return apiRequest<WaitingFor[]>("/waiting-for/", {
    query: {
      status: params?.status,
      person_id: params?.personId,
      project_id: params?.projectId,
      due: params?.due,
    },
  });
}

export async function completeWaitingFor(id: ApiId): Promise<WaitingFor> {
  return apiRequest<WaitingFor>(`/waiting-for/${id}/complete/`, {
    method: "POST",
  });
}

export async function changeWaitingForFollowUp(
  id: ApiId,
  followUpAt: string | null
): Promise<WaitingFor> {
  return apiRequest<WaitingFor>(`/waiting-for/${id}/change-follow-up/`, {
    method: "POST",
    body: {
      follow_up_at: followUpAt,
    },
  });
}

export async function convertWaitingForToNextAction(
  id: ApiId,
  payload: {
    context_id: ApiId;
    title?: string;
    notes?: string;
  }
): Promise<NextAction> {
  return apiRequest<NextAction>(`/waiting-for/${id}/convert-to-next-action/`, {
    method: "POST",
    body: payload,
  });
}

/**
 * Weekly Review
 */

export async function startWeeklyReview(): Promise<WeeklyReviewSession> {
  return apiRequest<WeeklyReviewSession>("/weekly-review/start/", {
    method: "POST",
  });
}

export async function getCurrentWeeklyReview(): Promise<
  WeeklyReviewSession | CurrentWeeklyReviewEmptyResponse
> {
  return apiRequest<WeeklyReviewSession | CurrentWeeklyReviewEmptyResponse>(
    "/weekly-review/current/"
  );
}

export async function getWeeklyReviewStep(
  reviewId: ApiId,
  step: WeeklyReviewStep
): Promise<WeeklyReviewStepResponse> {
  return apiRequest<WeeklyReviewStepResponse>(
    `/weekly-review/${reviewId}/step/${step}/`
  );
}

export async function completeWeeklyReviewStep(
  reviewId: ApiId,
  step: WeeklyReviewStep,
  notes = ""
): Promise<WeeklyReviewSession> {
  return apiRequest<WeeklyReviewSession>(
    `/weekly-review/${reviewId}/step/${step}/complete/`,
    {
      method: "POST",
      body: {
        notes,
      },
    }
  );
}

export async function skipWeeklyReviewStep(
  reviewId: ApiId,
  step: WeeklyReviewStep,
  notes = ""
): Promise<WeeklyReviewSession> {
  return apiRequest<WeeklyReviewSession>(
    `/weekly-review/${reviewId}/step/${step}/skip/`,
    {
      method: "POST",
      body: {
        notes,
      },
    }
  );
}

export async function finishWeeklyReview(
  reviewId: ApiId
): Promise<WeeklyReviewSession> {
  return apiRequest<WeeklyReviewSession>(`/weekly-review/${reviewId}/finish/`, {
    method: "POST",
  });
}

/**
 * Optional helper for checking whether getCurrentWeeklyReview returned nothing.
 */

export function isCurrentWeeklyReviewEmpty(
  value: WeeklyReviewSession | CurrentWeeklyReviewEmptyResponse
): value is CurrentWeeklyReviewEmptyResponse {
  return "current_review" in value && value.current_review === null;
}
