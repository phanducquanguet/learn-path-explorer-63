import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { TopNav } from "@/components/TopNav";
import {
  ArrowLeft,
  Hand,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  PhoneOff,
  Send,
  Users,
  MessageSquare,
  CircleDot,
  Pin,
  MoreVertical,
  Circle,
  PenSquare,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getLiveSession, liveParticipants, initialChat, type ChatMessage } from "@/lib/live-data";

export const Route = createFileRoute("/teacher/live/$sessionId")({
  head: () => ({ meta: [{ title: "Phòng giảng dạy — UNICOM LMS" }] }),
  component: TeacherLiveRoomPage,
});

function TeacherLiveRoomPage() {
  const { sessionId } = useParams({ from: "/teacher/live/$sessionId" });
  const session = getLiveSession(sessionId);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sharing, setSharing] = useState(true);
  const [recording, setRecording] = useState(true);
  const [sidebar, setSidebar] = useState<"chat" | "people">("people");
  const [messages, setMessages] = useState<ChatMessage[]>(initialChat);
  const [draft, setDraft] = useState("");
  const [participants, setParticipants] = useState(liveParticipants);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handsRaised = useMemo(() => participants.filter((p) => p.handRaised), [participants]);

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="text-2xl font-semibold">Không tìm thấy buổi học</h1>
          <Link to="/teacher/live" className="mt-4 inline-block text-primary hover:underline">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const toggleStudent = (id: string, key: "micOn" | "cameraOn" | "handRaised") => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [key]: !p[key] } : p)),
    );
  };

  const sendMessage = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        authorId: "u-teacher",
        authorName: session.teacher,
        role: "teacher",
        content: draft.trim(),
        at: new Date().toISOString(),
      },
    ]);
    setDraft("");
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <TopNav />
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-4 lg:flex-row">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/teacher/live"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Quản lý lịch
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white">
              <CheckCircle2 className="h-3 w-3" /> Bạn là giảng viên
            </span>
            {recording && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold text-white">
                <CircleDot className="h-3 w-3 animate-pulse" /> Đang ghi hình
              </span>
            )}
            {handsRaised.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-amber-950">
                <Hand className="h-3 w-3" /> {handsRaised.length} học viên giơ tay
              </span>
            )}
            <div className="text-sm text-white/90">
              <span className="font-semibold">{session.title}</span>
              <span className="ml-2 text-white/50">· {session.classCode}</span>
            </div>
          </div>

          {/* Stage */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-black ring-1 ring-white/10">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                  {sharing ? (
                    <MonitorUp className="h-10 w-10 text-emerald-300" />
                  ) : (
                    <Video className="h-10 w-10 text-white/80" />
                  )}
                </div>
                <div className="mt-3 text-sm text-white/80">
                  {sharing ? "Bạn đang chia sẻ màn hình" : "Đang phát camera của bạn"}
                </div>
                <div className="mt-1 text-xs text-white/50">{session.topic}</div>
              </div>
            </div>
            <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
              <Pin className="h-3 w-3" /> {sharing ? "Đang trình bày" : "Camera giảng viên"}
            </div>
            <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
              <Users className="h-3 w-3" /> {participants.length} người
            </div>
          </div>

          {/* Student tiles */}
          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-white/70">
              <span>Camera học viên ({participants.filter((p) => p.role === "student").length})</span>
              <span className="text-white/40">Bấm vào học viên để mở thao tác</span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {participants
                .filter((p) => p.role === "student")
                .map((p) => (
                  <StudentTile
                    key={p.id}
                    participant={p}
                    onToggleMic={() => toggleStudent(p.id, "micOn")}
                    onToggleCam={() => toggleStudent(p.id, "cameraOn")}
                    onLowerHand={() => toggleStudent(p.id, "handRaised")}
                  />
                ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-slate-900 p-3 ring-1 ring-white/10">
            <ControlBtn
              active={micOn}
              activeClass="bg-white/10 text-white"
              inactiveClass="bg-red-500 text-white"
              onClick={() => setMicOn((v) => !v)}
              label={micOn ? "Tắt mic" : "Bật mic"}
              icon={micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            />
            <ControlBtn
              active={camOn}
              activeClass="bg-white/10 text-white"
              inactiveClass="bg-red-500 text-white"
              onClick={() => setCamOn((v) => !v)}
              label={camOn ? "Tắt camera" : "Bật camera"}
              icon={camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            />
            <ControlBtn
              active={sharing}
              activeClass="bg-emerald-500 text-white"
              inactiveClass="bg-white/10 text-white"
              onClick={() => setSharing((v) => !v)}
              label={sharing ? "Đang chia sẻ" : "Chia sẻ màn hình"}
              icon={<MonitorUp className="h-4 w-4" />}
            />
            <ControlBtn
              active
              activeClass="bg-white/10 text-white"
              inactiveClass=""
              onClick={() => {}}
              label="Bảng trắng"
              icon={<PenSquare className="h-4 w-4" />}
            />
            <ControlBtn
              active={recording}
              activeClass="bg-red-500 text-white"
              inactiveClass="bg-white/10 text-white"
              onClick={() => setRecording((v) => !v)}
              label={recording ? "Dừng ghi hình" : "Bắt đầu ghi hình"}
              icon={<Circle className={cn("h-4 w-4", recording && "fill-current")} />}
            />
            <Link
              to="/teacher/live"
              className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
            >
              <PhoneOff className="h-4 w-4" /> Kết thúc lớp
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="flex w-full flex-col rounded-2xl bg-slate-900 ring-1 ring-white/10 lg:w-80">
          <div className="flex border-b border-white/10 p-2">
            <SidebarTab
              active={sidebar === "people"}
              onClick={() => setSidebar("people")}
              icon={<Users className="h-4 w-4" />}
            >
              Học viên ({participants.length})
            </SidebarTab>
            <SidebarTab
              active={sidebar === "chat"}
              onClick={() => setSidebar("chat")}
              icon={<MessageSquare className="h-4 w-4" />}
            >
              Chat
            </SidebarTab>
          </div>

          {sidebar === "people" ? (
            <div className="flex-1 overflow-y-auto p-2" style={{ maxHeight: 600 }}>
              {handsRaised.length > 0 && (
                <div className="mb-3 rounded-lg bg-amber-400/10 p-2">
                  <div className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                    Đang giơ tay
                  </div>
                  {handsRaised.map((p) => (
                    <PersonRow
                      key={p.id}
                      participant={p}
                      onToggleMic={() => toggleStudent(p.id, "micOn")}
                      onToggleCam={() => toggleStudent(p.id, "cameraOn")}
                      onLowerHand={() => toggleStudent(p.id, "handRaised")}
                      highlighted
                    />
                  ))}
                </div>
              )}
              {participants
                .filter((p) => !p.handRaised)
                .map((p) => (
                  <PersonRow
                    key={p.id}
                    participant={p}
                    onToggleMic={() => toggleStudent(p.id, "micOn")}
                    onToggleCam={() => toggleStudent(p.id, "cameraOn")}
                    onLowerHand={() => toggleStudent(p.id, "handRaised")}
                  />
                ))}
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto p-3" style={{ maxHeight: 480 }}>
                {messages.map((m) => (
                  <div key={m.id} className="text-sm">
                    <div className="flex items-baseline gap-2">
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          m.role === "teacher" ? "text-emerald-400" : "text-white/90",
                        )}
                      >
                        {m.authorName}
                      </span>
                      {m.role === "teacher" && (
                        <span className="rounded bg-emerald-400/20 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                          Bạn
                        </span>
                      )}
                      <span className="text-[10px] text-white/40">
                        {new Date(m.at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="mt-0.5 text-sm text-white/80">{m.content}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex items-center gap-2 border-t border-white/10 p-3"
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Gửi tin nhắn đến lớp..."
                  className="h-9 flex-1 rounded-full bg-white/10 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="submit"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function StudentTile({
  participant: p,
  onToggleMic,
  onToggleCam,
  onLowerHand,
}: {
  participant: (typeof liveParticipants)[number];
  onToggleMic: () => void;
  onToggleCam: () => void;
  onLowerHand: () => void;
}) {
  return (
    <div className="group relative aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 ring-1 ring-white/10">
      <div className="absolute inset-0 flex items-center justify-center">
        {p.cameraOn ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-5 text-xs font-semibold text-white">
            {p.initials}
          </div>
        ) : (
          <VideoOff className="h-5 w-5 text-white/40" />
        )}
      </div>
      {p.handRaised && (
        <button
          onClick={onLowerHand}
          title="Hạ tay"
          className="absolute left-1 top-1 rounded bg-amber-400 px-1 py-0.5 text-amber-900"
        >
          <Hand className="h-3 w-3" />
        </button>
      )}
      <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between gap-1">
        <span className="truncate rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
          {p.name}
        </span>
      </div>
      {/* Hover controls */}
      <div className="absolute right-1 top-1 hidden gap-1 group-hover:flex">
        <button
          onClick={onToggleMic}
          title={p.micOn ? "Tắt mic học viên" : "Cho phép nói"}
          className={cn(
            "rounded p-1 text-white",
            p.micOn ? "bg-white/20 hover:bg-white/30" : "bg-red-500 hover:bg-red-600",
          )}
        >
          {p.micOn ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
        </button>
        <button
          onClick={onToggleCam}
          title={p.cameraOn ? "Tắt camera học viên" : "Yêu cầu bật camera"}
          className={cn(
            "rounded p-1 text-white",
            p.cameraOn ? "bg-white/20 hover:bg-white/30" : "bg-red-500 hover:bg-red-600",
          )}
        >
          {p.cameraOn ? <Video className="h-3 w-3" /> : <VideoOff className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );
}

function PersonRow({
  participant: p,
  onToggleMic,
  onToggleCam,
  onLowerHand,
  highlighted,
}: {
  participant: (typeof liveParticipants)[number];
  onToggleMic: () => void;
  onToggleCam: () => void;
  onLowerHand: () => void;
  highlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-lg px-2 py-2",
        highlighted ? "bg-amber-400/10" : "hover:bg-white/5",
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white",
            p.role === "teacher"
              ? "bg-gradient-to-br from-emerald-500 to-teal-600"
              : "bg-gradient-to-br from-primary to-chart-5",
          )}
        >
          {p.initials}
        </div>
        <div>
          <div className="text-sm font-medium text-white">{p.name}</div>
          {p.role === "teacher" ? (
            <div className="text-[10px] text-emerald-400">Giáo viên</div>
          ) : p.handRaised ? (
            <div className="text-[10px] text-amber-400">Đang giơ tay</div>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {p.handRaised && (
          <button
            onClick={onLowerHand}
            title="Cho phép phát biểu / hạ tay"
            className="rounded p-1 text-amber-400 hover:bg-white/10"
          >
            <Hand className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={onToggleMic}
          title={p.micOn ? "Tắt mic" : "Bật mic"}
          className={cn("rounded p-1 hover:bg-white/10", p.micOn ? "text-white" : "text-white/30")}
        >
          {p.micOn ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={onToggleCam}
          title={p.cameraOn ? "Tắt cam" : "Bật cam"}
          className={cn("rounded p-1 hover:bg-white/10", p.cameraOn ? "text-white" : "text-white/30")}
        >
          {p.cameraOn ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
        </button>
        <button className="rounded p-1 text-white/60 hover:bg-white/10">
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ControlBtn({
  active,
  activeClass,
  inactiveClass,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  activeClass: string;
  inactiveClass: string;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition",
        active ? activeClass : inactiveClass,
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function SidebarTab({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition",
        active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/90",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
