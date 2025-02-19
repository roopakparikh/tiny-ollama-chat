import { useState, lazy, Suspense } from "react";
import { ChevronRight } from "lucide-react";
import { MessageType } from "../../lib/types";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import vscDarkPlus from "react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus";
import remarkGfm from "remark-gfm";

// Import only needed languages
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";

// Register languages
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("python", python);

// Lazy load ReactMarkdown
const ReactMarkdown = lazy(() => import("react-markdown"));

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const CodeComponent = ({ inline, className, children }: CodeProps) => {
  const match = /language-(\w+)/.exec(className || "");
  return !inline && match ? (
    <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div">
      {String(children).replace(/\n$/, "")}
    </SyntaxHighlighter>
  ) : (
    <code className={className}>{children}</code>
  );
};

const MessageComponent = ({ message }: { message: MessageType }) => {
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
  const isAssistant = message.Role === "assistant";
  const hasThinking = isAssistant && message.Thinking;

  const markdownComponents = {
    code: CodeComponent,
  };

  return (
    <div className={`py-4 ${isAssistant ? "bg-gray-900/50" : ""}`}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-1 text-xs font-medium text-gray-500">
          {isAssistant ? "Assistant" : "You"}
        </div>

        {hasThinking && (
          <div className="mb-2">
            <button
              onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
              className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-500 transition-colors"
            >
              <ChevronRight
                className={`w-3 h-3 transition-transform ${
                  isThinkingExpanded ? "rotate-90" : ""
                }`}
              />
              <span>
                Thought process
                {isThinkingExpanded &&
                  message.ThinkingTime &&
                  ` (${message.ThinkingTime.toFixed(2)}s)`}
              </span>
            </button>

            {isThinkingExpanded && message.Thinking && (
              <div className="mt-2 pl-6 py-2 border-l-2 border-blue-800/30 text-sm text-gray-500 bg-blue-900/10 rounded-r-md">
                <Suspense fallback={<div>Loading...</div>}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {message.Thinking}
                  </ReactMarkdown>
                </Suspense>
              </div>
            )}
          </div>
        )}

        <div
          className={`${
            isAssistant
              ? "text-gray-300"
              : "text-gray-200 bg-gray-800/50 p-3 rounded-lg"
          }`}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {message.Content}
            </ReactMarkdown>
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default MessageComponent;
