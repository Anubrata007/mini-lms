// ── Message types Native → WebView ────────────────────────────────────────

export interface CourseDataMessage {
    type: "COURSE_DATA";
    payload: {
        title: string;
        description: string;
        category: string;
        price: number;
        rating: number;
        progress: number;
        instructorName: string;
        instructorEmail: string;
        instructorAvatar: string;
    };
}

export interface ProgressUpdateMessage {
    type: "PROGRESS_UPDATE";
    payload: { percent: number };
}

export type NativeToWebMessage =
    | CourseDataMessage
    | ProgressUpdateMessage;

// ── Message types WebView → Native ────────────────────────────────────────

export interface LessonSelectedMessage {
    type: "LESSON_SELECTED";
    payload: {
        lessonIndex: number;
        lessonTitle: string;
    };
}

export interface LessonCompletedMessage {
    type: "LESSON_COMPLETED";
    payload: {
        completedCount: number;
        totalCount: number;
        progress: number;
    };
}

export interface WebViewReadyMessage {
    type: "WEBVIEW_READY";
    payload: {};
}

export type WebToNativeMessage =
    | LessonSelectedMessage
    | LessonCompletedMessage
    | WebViewReadyMessage;

// ── Helper to create injection script ─────────────────────────────────────

export function createCourseDataScript(
    message: CourseDataMessage
): string {
    return `
    (function() {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: '${JSON.stringify(message).replace(/'/g, "\\'")}'
        })
      );
    })();
    true;
  `;
}