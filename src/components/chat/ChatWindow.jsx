import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMessages, sendMessage } from "../../slice/messagingSlice";
import { uploadFile } from "../../slice/userSlice";

const ChatWindow = ({ conversationId, collaborator }) => {
  const dispatch = useDispatch();
  const { messagesByConversation = {}, loadingMessages = false } = useSelector(
    (s) => s.messaging
  );

  const currentConversationId = Number(conversationId) || null;
  const rawMessages = messagesByConversation?.[currentConversationId] || [];
  const messages = [...rawMessages].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const userId = Number(localStorage.getItem("user_id"));

  useEffect(() => {
    if (currentConversationId) {
      dispatch(fetchMessages({ conversationId: currentConversationId })).catch(
        (err) => console.error("fetchMessages error:", err)
      );
    }
  }, [currentConversationId, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const handleFileChange = (e) => {
    setError(null);
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);

    if (f.type.startsWith("image/") || f.type.startsWith("video/")) {
      setFilePreview(URL.createObjectURL(f));
    } else {
      setFilePreview(null);
    }
  };

  const removeAttachment = () => {
    setFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    if (!currentConversationId) {
      setError("No conversation selected");
      return;
    }

    if (!text.trim() && !file) return;

    setSending(true);

    let fileUrl = null;
    let message_type = "text";
    let fileId = null;

    if (file) {
      message_type = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : "file";

      try {
        const resultAction = await dispatch(uploadFile(file));
        if (uploadFile.fulfilled.match(resultAction)) {
          fileUrl = resultAction.payload.url;
          fileId = resultAction.payload.url;
        } else {
          throw new Error(resultAction.payload || "File upload failed");
        }
      } catch (err) {
        console.error("Upload error:", err);
        setError("Attachment upload failed. Try again.");
        setSending(false);
        return;
      }
    }

    try {
      await dispatch(
        sendMessage({
          conversationId: currentConversationId,
          text: text.trim() || null,
          file_url: fileUrl,
          file_id: fileId,
          message_type,
        })
      ).unwrap();

      setText("");
      removeAttachment();
      setSending(false);
    } catch (err) {
      console.error("sendMessage error:", err);
      setError("Failed to send message");
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!text.trim() && !file) return;
      handleSend();
    }
  };

  const canSend = text.trim().length > 0 || !!file;
  const placeholder = sending
    ? "Sending..."
    : "Type a message (Shift+Enter for newline)";

  return (
    // ---------------------------------------------------------------------------
    // UPDATED HEIGHT: h-[85vh] and min-h-[600px] to force it much taller
    // ---------------------------------------------------------------------------
    <div className="flex flex-col w-full h-[100vh] min-h-[600px] bg-card text-card-foreground shadow-lg border border-border overflow-hidden max-w-full rounded-xl">
      
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-card shrink-0">
        <img
          src={
            collaborator?.image_url ||
            "https://placehold.co/40x40/ffffff/000000?text=U"
          }
          alt="avatar"
          className="w-10 h-10 rounded-full border border-border object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">
            {collaborator?.full_name ||
              collaborator?.username ||
              "Conversation"}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {collaborator?.username || ""}
          </div>
        </div>
      </div>

      {/* Messages Area - Grows to fill remaining space */}
      <div
        className="flex-1 overflow-y-auto p-4 bg-background relative"
        ref={scrollContainerRef}
      >
        {loadingMessages && (
          <div className="py-6 text-center text-muted-foreground">
            Loading messages…
          </div>
        )}

        {!loadingMessages && messages.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No messages yet — start the conversation!
          </div>
        )}

        <div className="space-y-3">
          {messages.map((msg, idx) => {
            const isMine = Number(msg.sender_id) === userId;
            const key = msg.id ?? `${msg.created_at}-${idx}`;
            const content = msg.content ?? msg.text ?? "";
            
            return (
              <div
                key={key}
                className={`max-w-[80%] rounded-lg p-3 shadow-sm break-words ${
                  isMine
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "mr-auto bg-accent text-accent-foreground"
                }`}
              >
                {content && (
                  <div className="whitespace-pre-wrap">{content}</div>
                )}

                {/* -------------------------------------------------------
                    MEDIA FIX: Restrict height to max-h-60 (approx 240px)
                    and use w-auto to maintain aspect ratio.
                   ------------------------------------------------------- */}
                {msg.message_type === "image" && msg.file_url && (
                  <img
                    src={msg.file_url}
                    alt="attachment"
                    className="mt-2 max-h-60 w-auto rounded-md border border-border object-contain bg-black/10"
                  />
                )}
                
                {msg.message_type === "video" && msg.file_url && (
                  <video
                    controls
                    src={msg.file_url}
                    className="mt-2 max-h-60 w-auto rounded-md border border-border bg-black"
                  />
                )}
                
                {msg.message_type === "file" && msg.file_url && (
                  <a
                    href={msg.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm underline text-primary hover:opacity-90"
                  >
                    📎 Download attachment
                  </a>
                )}

                <div className="text-xs mt-2 opacity-70 text-right">
                  {msg.created_at
                    ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : ""}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Attachment Preview Section */}
      {file && (
        <div className="flex items-center gap-3 px-4 py-2 border-t border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            {filePreview ? (
              file.type.startsWith("image/") ? (
                <img
                  src={filePreview}
                  alt="preview"
                  className="w-16 h-16 rounded-md object-cover border border-border"
                />
              ) : file.type.startsWith("video/") ? (
                <video
                  src={filePreview}
                  className="w-24 h-16 rounded-md border border-border object-cover"
                />
              ) : (
                <div className="w-16 h-12 rounded-md flex items-center justify-center border border-border text-sm text-muted-foreground bg-muted">
                  FILE
                </div>
              )
            ) : (
              <div className="w-16 h-12 rounded-md flex items-center justify-center border border-border text-sm text-muted-foreground bg-muted">
                FILE
              </div>
            )}

            <div className="text-sm text-muted-foreground max-w-[200px] truncate">
              <div className="font-medium text-foreground truncate">{file.name}</div>
              <div className="text-xs">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={removeAttachment}
              className="px-3 py-1 rounded-md bg-muted text-muted-foreground hover:opacity-90 transition text-sm"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <form
        onSubmit={handleSend}
        className="flex items-end gap-2 px-3 py-3 border-t border-border bg-card shrink-0"
      >
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 resize-none min-h-[44px] max-h-40 px-3 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <input
          ref={fileInputRef}
          id="chat-file-input"
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        <label
          htmlFor="chat-file-input"
          className="inline-flex items-center justify-center w-[44px] h-[44px] rounded-md bg-accent text-accent-foreground cursor-pointer hover:opacity-90 transition"
          aria-label="Attach file"
        >
          📎
        </label>

        <button
          type="submit"
          disabled={!canSend || sending}
          className="inline-flex items-center justify-center h-[44px] px-6 rounded-md bg-primary text-primary-foreground hover:opacity-95 disabled:opacity-50 transition font-medium"
        >
          {sending ? "..." : "Send"}
        </button>
      </form>

      {error && (
        <div className="px-4 py-2 text-sm text-destructive bg-destructive/10 shrink-0">
          {error}
        </div>
      )}
    </div>
  );
};

export default ChatWindow;