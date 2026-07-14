import { XIcon } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
	isOpen: boolean;
	title: string;
	onClose: () => void;
	children: ReactNode;
	footer?: ReactNode;
	width?: "sm" | "md";
};

const modalWidths = {
	sm: "max-w-96",
	md: "max-w-120",
};

export function Modal({
	isOpen,
	title,
	onClose,
	children,
	footer,
	width = "sm",
}: ModalProps) {
	const titleId = useId();
	const modalRef = useRef<HTMLElement>(null);
	const onCloseRef = useRef(onClose);
	onCloseRef.current = onClose;

	useEffect(() => {
		if (!isOpen) return;
		const modal = modalRef.current;
		const previouslyFocused =
			document.activeElement instanceof HTMLElement
				? document.activeElement
				: null;
		const focusableSelector =
			'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

		const focusFrame = window.requestAnimationFrame(() => {
			const firstFocusable =
				modal?.querySelector<HTMLElement>(focusableSelector);
			(firstFocusable ?? modal)?.focus();
		});

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				onCloseRef.current();
				return;
			}

			if (event.key !== "Tab" || !modal) return;
			const focusableElements = Array.from(
				modal.querySelectorAll<HTMLElement>(focusableSelector),
			);

			if (focusableElements.length === 0) {
				event.preventDefault();
				modal.focus();
				return;
			}

			const firstFocusable = focusableElements[0];
			const lastFocusable = focusableElements.at(-1);
			if (
				event.shiftKey &&
				(document.activeElement === firstFocusable ||
					!modal.contains(document.activeElement))
			) {
				event.preventDefault();
				lastFocusable?.focus();
			} else if (
				!event.shiftKey &&
				(document.activeElement === lastFocusable ||
					!modal.contains(document.activeElement))
			) {
				event.preventDefault();
				firstFocusable.focus();
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		return () => {
			window.cancelAnimationFrame(focusFrame);
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = previousOverflow;
			previouslyFocused?.focus();
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100/50 p-4 backdrop-blur-[1px]">
			<section
				ref={modalRef}
				tabIndex={-1}
				className={`w-full ${modalWidths[width]} overflow-hidden rounded-lg border border-gray-500 bg-gray-600 shadow-xl`}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
			>
				<header className="flex h-14 items-center justify-between border-gray-500 border-b px-5">
					<h2 id={titleId} className="text-gray-100 text-sm-bold">
						{title}
					</h2>
					<button
						type="button"
						className="inline-flex h-8 w-8 items-center justify-center text-gray-300 transition-colors hover:text-gray-100"
						aria-label="Fechar"
						onClick={onClose}
					>
						<XIcon className="h-4 w-4" />
					</button>
				</header>

				<div className="p-5">{children}</div>

				{footer ? (
					<footer className="flex gap-2 border-gray-500 border-t p-5">
						{footer}
					</footer>
				) : null}
			</section>
		</div>,
		document.body,
	);
}
