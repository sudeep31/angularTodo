import {
    Component,
    signal,
    computed,
    CUSTOM_ELEMENTS_SCHEMA,
    AfterViewInit,
    ElementRef,
    viewChild,
    ChangeDetectionStrategy,
} from '@angular/core';

interface ContactFormData {
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
}

interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    subject?: string;
    message?: string;
}

@Component({
    selector: 'app-cl-contact-form',
    standalone: true,
    templateUrl: './cl-contact-form.component.html',
    styleUrl: './cl-contact-form.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ClContactFormComponent implements AfterViewInit {
    private readonly subjectSelectRef = viewChild<ElementRef>('subjectSelect');

    // ── Form state ────────────────────────────────────────────────────────────
    readonly firstName = signal('');
    readonly lastName = signal('');
    readonly email = signal('');
    readonly subject = signal('');
    readonly message = signal('');
    readonly errors = signal<FormErrors>({});
    readonly isSubmitting = signal(false);
    readonly isSubmitted = signal(false);

    readonly messageLength = computed(() => this.message().length);
    readonly messageRemaining = computed(() => 500 - this.messageLength());

    // ── Subject options for cl-select ─────────────────────────────────────────
    private readonly subjectOptions = [
        { label: 'General Enquiry', value: 'general' },
        { label: 'Bug Report', value: 'bug' },
        { label: 'Feature Request', value: 'feature' },
        { label: 'Component Question', value: 'component' },
        { label: 'Other', value: 'other' },
    ];

    ngAfterViewInit(): void {
        // cl-select requires options set via JS property (not HTML attribute)
        const el = this.subjectSelectRef()?.nativeElement;
        if (el) {
            el.options = this.subjectOptions;
        }
    }

    // ── Event handlers ────────────────────────────────────────────────────────
    onFirstNameChange(event: Event): void {
        this.firstName.set((event.target as HTMLInputElement).value);
        this.clearError('firstName');
    }

    onLastNameChange(event: Event): void {
        this.lastName.set((event.target as HTMLInputElement).value);
        this.clearError('lastName');
    }

    onEmailChange(event: Event): void {
        this.email.set((event.target as HTMLInputElement).value);
        this.clearError('email');
    }

    onSubjectChange(event: Event): void {
        const customEvent = event as CustomEvent<{ value: string }>;
        const val = customEvent.detail?.value ?? (event.target as HTMLSelectElement).value;
        this.subject.set(val);
        this.clearError('subject');
    }

    onMessageChange(event: Event): void {
        const val = (event.target as HTMLTextAreaElement).value;
        this.message.set(val.slice(0, 500));
        this.clearError('message');
    }

    async onSubmit(): Promise<void> {
        const formErrors = this.validate();
        if (Object.keys(formErrors).length > 0) {
            this.errors.set(formErrors);
            return;
        }

        this.isSubmitting.set(true);
        this.errors.set({});

        try {
            // Simulate async submission
            await new Promise<void>((resolve) => setTimeout(resolve, 1500));

            const payload: ContactFormData = {
                firstName: this.firstName(),
                lastName: this.lastName(),
                email: this.email(),
                subject: this.subject(),
                message: this.message(),
            };
            console.log('Form submitted:', payload);
            this.isSubmitted.set(true);
        } finally {
            this.isSubmitting.set(false);
        }
    }

    onReset(): void {
        this.firstName.set('');
        this.lastName.set('');
        this.email.set('');
        this.subject.set('');
        this.message.set('');
        this.errors.set({});
        this.isSubmitted.set(false);

        // Reset cl-select value via property
        const el = this.subjectSelectRef()?.nativeElement;
        if (el) {
            el.value = '';
        }
    }

    // ── Validation ────────────────────────────────────────────────────────────
    private validate(): FormErrors {
        const errs: FormErrors = {};

        if (!this.firstName().trim()) {
            errs.firstName = 'First name is required.';
        }
        if (!this.lastName().trim()) {
            errs.lastName = 'Last name is required.';
        }
        if (!this.email().trim()) {
            errs.email = 'Email address is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email())) {
            errs.email = 'Please enter a valid email address.';
        }
        if (!this.subject()) {
            errs.subject = 'Please select a subject.';
        }
        if (!this.message().trim()) {
            errs.message = 'Message is required.';
        } else if (this.message().trim().length < 10) {
            errs.message = 'Message must be at least 10 characters.';
        }

        return errs;
    }

    private clearError(field: keyof FormErrors): void {
        const current = this.errors();
        if (current[field]) {
            const updated = { ...current };
            delete updated[field];
            this.errors.set(updated);
        }
    }
}
