import createDebounce from "@solid-primitives/debounce";
import { createQuery } from "@tanstack/solid-query";
import {
  createEffect,
  createSignal,
  For,
  Match,
  onCleanup,
  onMount,
  ParentProps,
  Show,
  Switch,
} from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { Spinner } from "./spinner.component";

type Props = {};

type Option = {
  placeId: string;
  address: string;
};

type Response = {
  data: Option[];
  message: string;
  status: boolean;
};

const URL = "https://api-stage.foodibd.com/maps/autocomplete?search=";

async function getData({ queryKey }: { queryKey: string[] }) {
  const res = (await fetch(URL + queryKey?.[1] || "")).json();
  const result: Response = await res;

  return result;
}

export const AutoComplete = () => {
  const [showPortal, setShowPortal] = createSignal(false);
  const [options, setOptions] = createSignal([
    { label: "Apple", value: "apple" },
    { label: "Egg", value: "egg" },
    { label: "Water", value: "Water" },
  ]);
  const [keyboardArrowSelectionIndex, setSelectionIndex] = createSignal(-1);
  const [isFocus, setIsFoucs] = createSignal(false);
  const [loading, setLoading] = createSignal(false); // this should be change later;
  const [value, setValue] = createSignal("");
  const [debounceValue, setDebounceValue] = createSignal("");
  const debounceInput = createDebounce((inputValue: string) => {
    if (inputValue) {
      setDebounceValue(inputValue);
    }
  }, 750);
  const getOptions = createQuery(() => ({
    queryKey: ["Place", debounceValue()],
    enabled: !!debounceValue(),
    staleTime: Infinity,
    queryFn: getData,
  }));
  let inputRef: HTMLInputElement | undefined;
  let divRef: HTMLDivElement | undefined;

  onMount(() => {
    window.addEventListener("click", (event) => {
      if (
        !inputRef?.contains(event.target as Node) &&
        !divRef?.contains(event.target as Node)
      ) {
        setShowPortal(false);
        setSelectionIndex(-1);
      }
    });
  });
  onCleanup(() => {
    window.removeEventListener("click", () => {
      setShowPortal(false);
    });
  });

  const onKeyPress = (e: KeyboardEvent) => {
    if (getOptions.isFetching) return;
    if (
      e.key === "ArrowDown" &&
      keyboardArrowSelectionIndex() < options().length - 1
    ) {
      setSelectionIndex((prev) => prev + 1);
    } else if (e.key === "ArrowUp") {
      if (keyboardArrowSelectionIndex() < 0) return;
      if (keyboardArrowSelectionIndex() === 0) {
        setSelectionIndex(0);
      } else {
        setSelectionIndex((prev) => prev - 1);
      }
    } else if (e.key === "Enter") {
      console.log(
        "you enter me",
        getOptions.data?.data?.[keyboardArrowSelectionIndex()]
      );
    }
  };

  createEffect(() => {
    if (isFocus()) {
      window.addEventListener("keydown", onKeyPress);
    } else {
      window.removeEventListener("keypress", onKeyPress);
    }
  });

  createEffect(() => {
    if (value()) {
      debounceInput(value());
    }
  });

  createEffect(() => {
    console.log({ data: getOptions.data });
  });

  return (
    <div class="auto-complete-container">
      <div id="auto-complete-wrapper" ref={divRef}>
        <div class="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            class="autocomplete-input"
            value={value()}
            onInput={(e) => {
              setValue(e.target.value);
            }}
            onClick={() => {
              setShowPortal(true);
            }}
            onFocusIn={() => {
              setIsFoucs(true);
            }}
            onFocusOut={() => {
              setIsFoucs(false);
            }}
            placeholder="Type anything"
          />

          <Switch>
            <Match when={getOptions.isFetching}>
              <div class="auto-complete-icons-container">
                <Spinner />
              </div>
            </Match>
            <Match when={!loading()}>
              <div class="auto-complete-icons">
                <IconButtonWrapper>
                  <Show when={showPortal()} fallback={<Down />}>
                    <Up />
                  </Show>
                </IconButtonWrapper>
              </div>
            </Match>
          </Switch>
        </div>
        {/* <Portal mount={document.querySelector("#auto-complete-wrapper")!}> */}
        <Presence>
          <Show when={showPortal()}>
            <Motion.div
              initial={{ y: 5, opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              id="auto-complete-dropdown"
            >
              <ul role="menu">
                <Switch>
                  <Match when={getOptions.isFetching}>
                    <div>Loading...</div>
                  </Match>
                  <Match when={!getOptions.data?.data}>
                    <div>No Option</div>
                  </Match>
                  <Match when={getOptions.data?.data.length}>
                    <For each={getOptions.data?.data || []}>
                      {(item, index) => (
                        <li
                          class={`${
                            index() === keyboardArrowSelectionIndex()
                              ? "active"
                              : ""
                          }`}
                          role="menuitem"
                          onClick={() => {
                            console.log({ item });
                          }}
                        >
                          {item.address}
                        </li>
                      )}
                    </For>
                  </Match>
                </Switch>
              </ul>
            </Motion.div>
          </Show>
        </Presence>
        {/* </Portal> */}
      </div>
    </div>
  );
};

function IconButtonWrapper(props: ParentProps) {
  return (
    <button type="button" class="icon-btn">
      {props.children}
    </button>
  );
}

function Down() {
  return (
    <Motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      class="size-5"
      initial={{
        y: -10,
      }}
      animate={{
        y: 0,
      }}
    >
      <path
        fill-rule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clip-rule="evenodd"
      />
    </Motion.svg>
  );
}

function Up() {
  return (
    <Motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      class="size-5"
      initial={{
        y: 10,
      }}
      animate={{
        y: 0,
      }}
    >
      <path
        fill-rule="evenodd"
        d="M9.47 6.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 8.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06l4.25-4.25Z"
        clip-rule="evenodd"
      />
    </Motion.svg>
  );
}
