import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState, useCallback, useEffect } from "react";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useCourses } from "@/store/CourseContext";
import { appStorage } from "@/services/storage";
import { STORAGE_KEYS } from "@/utils/constants";
import {
  createCourseDataScript,
  WebToNativeMessage,
} from "@/services/webview-bridge";

// ── Inline HTML ──

const getCourseHtml = () => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Course Content</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    :root{
      --primary:#3b82f6;
      --success:#10b981;
      --bg:#f8fafc;
      --card:#ffffff;
      --text:#1e293b;
      --muted:#64748b;
      --border:#e2e8f0;
      --radius:12px;
    }
    body{
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      background:var(--bg);
      color:var(--text);
      min-height:100vh;
    }

    /* Hero */
    .hero{
      background:linear-gradient(135deg,#1d4ed8 0%,#3b82f6 60%,#60a5fa 100%);
      padding:36px 20px 56px;
      position:relative;
      overflow:hidden;
    }
    .hero::before{
      content:'';position:absolute;top:-40%;right:-15%;
      width:260px;height:260px;
      background:rgba(255,255,255,0.07);border-radius:50%;
    }
    .hero::after{
      content:'';position:absolute;bottom:-30%;left:-10%;
      width:180px;height:180px;
      background:rgba(255,255,255,0.05);border-radius:50%;
    }
    .hero-badge{
      display:inline-block;background:rgba(255,255,255,0.2);
      color:#fff;font-size:10px;font-weight:600;
      padding:4px 12px;border-radius:20px;margin-bottom:10px;
      text-transform:uppercase;letter-spacing:1px;
    }
    .hero-title{
      font-size:22px;font-weight:800;color:#fff;
      line-height:1.3;margin-bottom:6px;position:relative;z-index:1;
    }
    .hero-instructor{
      color:rgba(255,255,255,0.75);font-size:13px;margin-bottom:20px;
    }
    .hero-stats{display:flex;gap:24px;}
    .stat{text-align:center;}
    .stat-value{font-size:20px;font-weight:800;color:#fff;}
    .stat-label{font-size:10px;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:0.5px;}

    /* Progress Card */
    .progress-card{
      background:var(--card);margin:-20px 16px 16px;
      border-radius:var(--radius);padding:16px;
      box-shadow:0 4px 20px rgba(0,0,0,0.08);position:relative;z-index:10;
    }
    .progress-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;}
    .progress-title{font-size:13px;font-weight:600;color:var(--text);}
    .progress-percent{font-size:13px;font-weight:700;color:var(--primary);}
    .progress-bar{background:#e2e8f0;height:8px;border-radius:4px;overflow:hidden;}
    .progress-fill{
      height:100%;
      background:linear-gradient(90deg,#3b82f6,#60a5fa);
      border-radius:4px;width:0%;transition:width 1s ease;
    }

    /* Section */
    .section{padding:0 16px 16px;}
    .section-title{
      font-size:16px;font-weight:700;color:var(--text);
      margin-bottom:12px;display:flex;align-items:center;gap:8px;
    }

    /* About */
    .about-card{
      background:var(--card);border-radius:var(--radius);
      padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.04);
      border:1px solid var(--border);margin-bottom:4px;
    }
    .about-text{font-size:13px;color:var(--muted);line-height:1.7;}

    /* Instructor */
    .instructor-card{
      background:var(--card);border-radius:var(--radius);
      padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.04);
      border:1px solid var(--border);
      display:flex;align-items:center;gap:12px;margin-bottom:4px;
    }
    .instructor-avatar{
      width:52px;height:52px;border-radius:50%;
      object-fit:cover;background:#e2e8f0;flex-shrink:0;
    }
    .instructor-name{font-size:15px;font-weight:700;color:var(--text);}
    .instructor-email{font-size:12px;color:var(--muted);margin-top:2px;}
    .instructor-badge{
      margin-left:auto;background:#dbeafe;color:var(--primary);
      font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;
      flex-shrink:0;
    }

    /* Lesson Card */
    .lesson-card{
      background:var(--card);border-radius:var(--radius);
      margin-bottom:10px;overflow:hidden;
      box-shadow:0 2px 8px rgba(0,0,0,0.04);
      border:1px solid var(--border);cursor:pointer;
      transition:transform 0.15s ease;
    }
    .lesson-card.completed{border-color:#d1fae5;}
    .lesson-card.active{border-color:var(--primary);box-shadow:0 4px 16px rgba(59,130,246,0.15);}
    .lesson-inner{display:flex;align-items:center;padding:14px;gap:12px;}
    .lesson-icon{
      width:42px;height:42px;border-radius:10px;
      display:flex;align-items:center;justify-content:center;
      font-size:18px;flex-shrink:0;
    }
    .lesson-icon.done{background:#d1fae5;}
    .lesson-icon.now{background:#dbeafe;}
    .lesson-icon.lock{background:#f1f5f9;}
    .lesson-info{flex:1;}
    .lesson-number{font-size:10px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;}
    .lesson-title-text{font-size:14px;font-weight:600;color:var(--text);margin-bottom:2px;}
    .lesson-meta{font-size:11px;color:var(--muted);}

    /* CTA */
    .cta-section{padding:0 16px 40px;}
    .cta-btn{
      width:100%;padding:16px;
      background:linear-gradient(135deg,#1d4ed8,#3b82f6);
      color:#fff;border:none;border-radius:var(--radius);
      font-size:16px;font-weight:700;cursor:pointer;
      display:flex;align-items:center;justify-content:center;gap:8px;
      box-shadow:0 4px 16px rgba(59,130,246,0.4);
    }

    /* Toast */
    .toast{
      position:fixed;bottom:24px;left:50%;
      transform:translateX(-50%) translateY(120px);
      background:#1e293b;color:#fff;
      padding:12px 20px;border-radius:50px;
      font-size:13px;font-weight:500;
      transition:transform 0.3s ease;z-index:999;white-space:nowrap;
    }
    .toast.show{transform:translateX(-50%) translateY(0);}
  </style>
</head>
<body>

  <!-- Hero -->
  <div class="hero">
    <div class="hero-badge" id="hero-category">Loading...</div>
    <div class="hero-title" id="hero-title">Loading course...</div>
    <div class="hero-instructor" id="hero-instructor">by Instructor</div>
    <div class="hero-stats">
      <div class="stat">
        <div class="stat-value" id="stat-rating">—</div>
        <div class="stat-label">Rating</div>
      </div>
      <div class="stat">
        <div class="stat-value" id="stat-price">—</div>
        <div class="stat-label">Price</div>
      </div>
      <div class="stat">
        <div class="stat-value">12</div>
        <div class="stat-label">Lessons</div>
      </div>
      <div class="stat">
        <div class="stat-value">6h</div>
        <div class="stat-label">Duration</div>
      </div>
    </div>
  </div>

  <!-- Progress -->
  <div class="progress-card">
    <div class="progress-header">
      <span class="progress-title">Your Progress</span>
      <span class="progress-percent" id="progress-percent">0%</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" id="progress-fill"></div>
    </div>
  </div>

  <!-- About -->
  <div class="section">
    <div class="section-title">📖 About</div>
    <div class="about-card">
      <div class="about-text" id="about-text">Loading...</div>
    </div>
  </div>

  <!-- Instructor -->
  <div class="section">
    <div class="section-title">👨‍🏫 Instructor</div>
    <div class="instructor-card">
      <img
        class="instructor-avatar" id="instructor-avatar"
        src="" alt="Instructor"
        onerror="this.src='https://ui-avatars.com/api/?name=Instructor&background=3b82f6&color=fff&size=100'"
      />
      <div style="flex:1">
        <div class="instructor-name" id="instructor-name">Loading...</div>
        <div class="instructor-email" id="instructor-email">...</div>
      </div>
      <div class="instructor-badge">Expert</div>
    </div>
  </div>

  <!-- Lessons -->
  <div class="section">
    <div class="section-title">🎬 Course Content</div>
    <div id="lessons-container"></div>
  </div>

  <!-- CTA -->
  <div class="cta-section">
    <button class="cta-btn" onclick="handleStartLesson()">
      <span>▶</span>
      <span id="cta-text">Start First Lesson</span>
    </button>
  </div>

  <!-- Toast -->
  <div class="toast" id="toast"></div>

  <script>
    var courseData = null;
    var completedLessons = [];
    var currentLesson = 0;

    var lessonTitles = [
      'Introduction & Overview','Core Fundamentals','Getting Started',
      'Key Concepts Deep Dive','Practical Application','Hands-on Project',
      'Advanced Techniques','Real-world Examples','Best Practices',
      'Common Mistakes to Avoid','Performance & Optimization',
      'Final Project & Wrap Up'
    ];

    var lessonDurations = [
      '5 min','12 min','18 min','22 min','30 min','45 min',
      '25 min','35 min','20 min','15 min','28 min','40 min'
    ];

    // Receive messages from Native
    document.addEventListener('message', function(event) {
      handleNativeMessage(event.data);
    });
    window.addEventListener('message', function(event) {
      handleNativeMessage(event.data);
    });

    function handleNativeMessage(data) {
      try {
        var message = JSON.parse(data);
        if (message.type === 'COURSE_DATA') {
          courseData = message.payload;
          renderCourse();
        }
        if (message.type === 'PROGRESS_UPDATE') {
          updateProgress(message.payload.percent);
        }
      } catch(e) {}
    }

    function renderCourse() {
      if (!courseData) return;
      document.getElementById('hero-title').textContent = courseData.title;
      document.getElementById('hero-category').textContent = courseData.category;
      document.getElementById('hero-instructor').textContent = 'by ' + courseData.instructorName;
      document.getElementById('stat-rating').textContent = parseFloat(courseData.rating).toFixed(1);
      document.getElementById('stat-price').textContent = '$' + parseFloat(courseData.price).toFixed(0);
      document.getElementById('about-text').textContent = courseData.description;
      document.getElementById('instructor-name').textContent = courseData.instructorName;
      document.getElementById('instructor-email').textContent = courseData.instructorEmail;
      document.getElementById('instructor-avatar').src = courseData.instructorAvatar;
      renderLessons();
      setTimeout(function(){ updateProgress(courseData.progress || 0); }, 600);
    }

    function renderLessons() {
      var container = document.getElementById('lessons-container');
      container.innerHTML = '';
      lessonTitles.forEach(function(title, index) {
        var isDone = completedLessons.indexOf(index) !== -1;
        var isNow = index === currentLesson;
        var isLock = index > currentLesson && !isDone;

        var card = document.createElement('div');
        card.className = 'lesson-card' + (isDone ? ' completed' : isNow ? ' active' : '');
        card.onclick = function(){ selectLesson(index); };

        var iconClass = isDone ? 'done' : isNow ? 'now' : 'lock';
        var iconEmoji = isDone ? '✅' : isNow ? '▶️' : isLock ? '🔒' : '📄';
        var statusEmoji = isDone ? '✅' : isNow ? '🔵' : '⚪';

        card.innerHTML =
          '<div class="lesson-inner">' +
            '<div class="lesson-icon ' + iconClass + '">' + iconEmoji + '</div>' +
            '<div class="lesson-info">' +
              '<div class="lesson-number">Lesson ' + (index + 1) + '</div>' +
              '<div class="lesson-title-text">' + title + '</div>' +
              '<div class="lesson-meta">' + lessonDurations[index] + '</div>' +
            '</div>' +
            '<div>' + statusEmoji + '</div>' +
          '</div>';

        container.appendChild(card);
      });
    }

    function selectLesson(index) {
      if (index > currentLesson && completedLessons.indexOf(index) === -1) {
        showToast('Complete previous lessons first 🔒');
        return;
      }
      currentLesson = index;
      renderLessons();
      sendToNative({ type: 'LESSON_SELECTED', payload: { lessonIndex: index, lessonTitle: lessonTitles[index] } });
      updateCTA();
    }

    function handleStartLesson() {
      if (completedLessons.indexOf(currentLesson) === -1) {
        completedLessons.push(currentLesson);
      }
      if (currentLesson < lessonTitles.length - 1) {
        currentLesson++;
      }
      var progress = Math.round((completedLessons.length / lessonTitles.length) * 100);
      renderLessons();
      updateProgress(progress);
      updateCTA();
      sendToNative({
        type: 'LESSON_COMPLETED',
        payload: { completedCount: completedLessons.length, totalCount: lessonTitles.length, progress: progress }
      });
      showToast(completedLessons.length === lessonTitles.length ? '🎉 Course completed!' : '✅ Lesson ' + completedLessons.length + ' completed!');
    }

    function updateProgress(percent) {
      document.getElementById('progress-percent').textContent = percent + '%';
      document.getElementById('progress-fill').style.width = percent + '%';
    }

    function updateCTA() {
      var text = document.getElementById('cta-text');
      text.textContent = completedLessons.length === lessonTitles.length
        ? 'Course Completed 🎉'
        : 'Start Lesson ' + (currentLesson + 1);
    }

    function sendToNative(message) {
      try {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        }
      } catch(e) {}
    }

    function showToast(msg) {
      var toast = document.getElementById('toast');
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(function(){ toast.classList.remove('show'); }, 2500);
    }

    // Tell native we are ready
    sendToNative({ type: 'WEBVIEW_READY', payload: {} });
  </script>
</body>
</html>
`;

// ── Screen Component ──

export default function CourseWebViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { courses } = useCourses();
  const webViewRef = useRef<WebView>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentLesson, setCurrentLesson] = useState("");

  const course = courses.find((c) => c.id === id);

  // Load saved progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      if (!id) return;
      const progressKey = `${STORAGE_KEYS.ENROLLED_COURSES}_progress_${id}`;
      const saved = await appStorage.get<number>(progressKey);
      if (saved) setProgress(saved);
    };
    loadProgress();
  }, [id]);

  // Inject course data into WebView
  const injectCourseData = useCallback(() => {
    if (!course || !webViewRef.current) return;

    const message = {
      type: "COURSE_DATA" as const,
      payload: {
        title: course.title,
        description: course.description,
        category: course.category,
        price: course.price,
        rating: course.rating,
        progress: progress,
        instructorName: course.instructor.name,
        instructorEmail: course.instructor.email,
        instructorAvatar: course.instructor.avatar,
      },
    };

    const script = createCourseDataScript(message);
    webViewRef.current.injectJavaScript(script);
  }, [course, progress]);

  // Handle messages from WebView
  const handleMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      try {
        const message: WebToNativeMessage = JSON.parse(
          event.nativeEvent.data
        );

        switch (message.type) {
          case "WEBVIEW_READY":
            injectCourseData();
            break;

          case "LESSON_SELECTED":
            setCurrentLesson(message.payload.lessonTitle);
            break;

          case "LESSON_COMPLETED":
            const newProgress = message.payload.progress;
            setProgress(newProgress);

            // Persist progress
            const progressKey = `${STORAGE_KEYS.ENROLLED_COURSES}_progress_${id}`;
            await appStorage.set(progressKey, newProgress);

            // Native alert on completion
            if (
              message.payload.completedCount === message.payload.totalCount
            ) {
              Alert.alert(
                "🎉 Congratulations!",
                `You have completed "${course?.title}"!`,
                [
                  {
                    text: "Back to Courses",
                    onPress: () => router.replace("/(tabs)"),
                  },
                  { text: "Review", style: "cancel" },
                ]
              );
            }
            break;
        }
      } catch {
        // Invalid message
      }
    },
    [course, id, injectCourseData, router]
  );

  // Course not found
  if (!course) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text style={{ fontSize: 56 }}>😕</Text>
        <Text className="text-gray-900 font-bold text-xl mt-4 text-center">
          Course not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-blue-500 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // WebView load error
  if (hasError) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text style={{ fontSize: 56 }}>😕</Text>
        <Text className="text-gray-900 font-bold text-xl mt-4 text-center">
          Failed to load content
        </Text>
        <Text className="text-gray-500 text-sm mt-2 text-center">
          Something went wrong loading the course content
        </Text>
        <View className="flex-row gap-3 mt-6">
          <TouchableOpacity
            onPress={() => setHasError(false)}
            className="bg-blue-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-gray-200 px-6 py-3 rounded-xl"
          >
            <Text className="text-gray-700 font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Top Bar */}
      <View className="bg-blue-500 pt-12 pb-3 px-4 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 bg-white/20 rounded-full items-center justify-center"
        >
          <Text className="text-white text-base">←</Text>
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="text-white font-bold text-sm" numberOfLines={1}>
            {course.title}
          </Text>
          <Text className="text-blue-100 text-xs" numberOfLines={1}>
            {currentLesson || "Course Content"}
          </Text>
        </View>

        <View className="bg-white/20 px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-bold">{progress}%</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="h-1 bg-blue-200">
        <View className="h-1 bg-white" style={{ width: `${progress}%` }} />
      </View>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ html: getCourseHtml() }}
        onMessage={handleMessage}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        originWhitelist={["*"]}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <View className="absolute inset-0 bg-white items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-gray-500 text-sm mt-3">
            Preparing your course...
          </Text>
        </View>
      )}
    </View>
  );
}