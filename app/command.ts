import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Locale from "./locales";

type Command = (param: string) => void;
type AsyncCommand = (param: string) => Promise<void>;
interface Commands {
  fill?: Command;
  submit?: Command;
  mask?: Command;
  code?: Command;
  settings?: Command;
  thread_id?: AsyncCommand;
}

export function useCommand(commands: Commands = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const processedCommandsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let shouldUpdate = false;

    // First check React Router search params
    searchParams.forEach((param, name) => {
      const commandName = name as keyof Commands;
      const commandKey = `${name}:${param}`;

      if (
        typeof commands[commandName] === "function" &&
        !processedCommandsRef.current.has(commandKey)
      ) {
        commands[commandName]!(param);
        searchParams.delete(name);
        shouldUpdate = true;
        processedCommandsRef.current.add(commandKey);
      }
    });

    // Then check URL search params (for HashRouter compatibility)
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.forEach((param, name) => {
      const commandName = name as keyof Commands;
      const commandKey = `${name}:${param}`;

      if (
        typeof commands[commandName] === "function" &&
        !processedCommandsRef.current.has(commandKey)
      ) {
        commands[commandName]!(param);
        // Clear the URL parameter by updating the URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete(name);
        window.history.replaceState({}, "", newUrl.toString());
        processedCommandsRef.current.add(commandKey);
      }
    });

    if (shouldUpdate) {
      setSearchParams(searchParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, commands]);
}

interface ChatCommands {
  new?: Command;
  newm?: Command;
  next?: Command;
  prev?: Command;
  clear?: Command;
  fork?: Command;
  del?: Command;
}

// Compatible with Chinese colon character "："
export const ChatCommandPrefix = /^[:：]/;

export function useChatCommand(commands: ChatCommands = {}) {
  function extract(userInput: string) {
    const match = userInput.match(ChatCommandPrefix);
    if (match) {
      return userInput.slice(1) as keyof ChatCommands;
    }
    return userInput as keyof ChatCommands;
  }

  function search(userInput: string) {
    const input = extract(userInput);
    const desc = Locale.Chat.Commands;
    return Object.keys(commands)
      .filter((c) => c.startsWith(input))
      .map((c) => ({
        title: desc[c as keyof ChatCommands],
        content: ":" + c,
      }));
  }

  function match(userInput: string) {
    const command = extract(userInput);
    const matched = typeof commands[command] === "function";

    return {
      matched,
      invoke: () => matched && commands[command]!(userInput),
    };
  }

  return { match, search };
}
