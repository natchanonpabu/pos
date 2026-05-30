---
name: form-gen
description: Generate React forms with validation using React Hook Form, Formik, or custom patterns. Supports Zod, Yup, Joi validation schemas. Use when creating forms, adding validation, handling form submission, or when user mentions "create form", "add validation", "form with validation", "multi-step form", "dynamic form", or wants to work with forms. Auto-detects project's form library and validation schema.
---

# Form Generator Skill

Generate type-safe React forms with validation, error handling, and submission logic. Adapts to your project's form management library and validation approach.

## When to Use This Skill

- Creating new forms (login, registration, checkout, etc.)
- Adding form validation
- Setting up form state management
- Generating validation schemas
- Creating multi-step forms
- Dynamic form fields
- File upload forms
- Form with complex validation rules

## Initial Setup: Detect Project Patterns

### Step 1: Detect Form Library

Check `package.json` for:
- **React Hook Form**: `react-hook-form` (recommended)
- **Formik**: `formik`
- **React Final Form**: `react-final-form`
- **Custom**: useState + manual validation

### Step 2: Detect Validation Library

Check `package.json` for:
- **Zod**: `zod` (TypeScript-first)
- **Yup**: `yup` (schema-based)
- **Joi**: `joi`
- **Class Validator**: `class-validator`
- **Native HTML5**: Built-in validation
- **Custom**: Manual validation functions

### Step 3: Detect UI Library

Check for form components:
- **Material-UI**: `@mui/material`
- **Ant Design**: `antd`
- **Chakra UI**: `@chakra-ui/react`
- **Shadcn/ui**: Check for components folder
- **Headless UI**: `@headlessui/react`
- **Native HTML**: Default input elements

### Step 4: Detect Integration Patterns

Look for:
- Resolver integration (`@hookform/resolvers`)
- Error handling patterns
- Submission handling (API calls)
- Success/error toast patterns

### Step 5: Document Setup

```
Form setup detected:
- Form library: React Hook Form
- Validation: Zod
- UI: Material-UI
- Resolver: @hookform/resolvers/zod
- Toast: notistack
- API client: axios
```

## React Hook Form + Zod Pattern

### Basic Form

**Validation Schema** (`schemas/user-schema.ts`):
```typescript
import { z } from 'zod'

export const userSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string()
    .email('Invalid email address'),
  age: z.number()
    .int()
    .min(18, 'Must be at least 18 years old')
    .optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type UserFormData = z.infer<typeof userSchema>
```

**Form Component** (`components/user-form.tsx`):
```typescript
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { userSchema, type UserFormData } from '@/schemas/user-schema'

interface UserFormProps {
  onSubmit: (data: UserFormData) => Promise<void>
  defaultValues?: Partial<UserFormData>
}

export const UserForm = ({ onSubmit, defaultValues }: UserFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues,
  })

  const onSubmitHandler = async (data: UserFormData) => {
    try {
      await onSubmit(data)
      reset()
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          {...register('name')}
        />
        {errors.name && <span>{errors.name.message}</span>}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register('email')}
        />
        {errors.email && <span>{errors.email.message}</span>}
      </div>

      <div>
        <label htmlFor="age">Age</label>
        <input
          id="age"
          type="number"
          {...register('age', { valueAsNumber: true })}
        />
        {errors.age && <span>{errors.age.message}</span>}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          {...register('password')}
        />
        {errors.password && <span>{errors.password.message}</span>}
      </div>

      <div>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
```

### With Material-UI

```typescript
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button, TextField, CircularProgress } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { userSchema, type UserFormData } from '@/schemas/user-schema'

export const UserFormMUI = ({ onSubmit }: UserFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Name"
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
            margin="normal"
          />
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Email"
            type="email"
            error={!!errors.email}
            helperText={errors.email?.message}
            fullWidth
            margin="normal"
          />
        )}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
        fullWidth
      >
        {isSubmitting ? <CircularProgress size={24} /> : 'Submit'}
      </Button>
    </form>
  )
}
```

## Advanced Patterns

### Multi-Step Form

**Schema**:
```typescript
// Step schemas
const step1Schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const step2Schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
})

const step3Schema = z.object({
  address: z.string(),
  city: z.string(),
  zipCode: z.string().regex(/^\d{5}$/),
})

// Combined schema
export const registrationSchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
})

export type RegistrationData = z.infer<typeof registrationSchema>
```

**Component**:
```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registrationSchema, type RegistrationData } from '@/schemas/registration'

const steps = [
  { title: 'Account', schema: step1Schema },
  { title: 'Personal', schema: step2Schema },
  { title: 'Address', schema: step3Schema },
]

export const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
  } = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onBlur',
  })

  const nextStep = async () => {
    const fields = Object.keys(steps[currentStep].schema.shape) as Array<
      keyof RegistrationData
    >
    const isValid = await trigger(fields)
    
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const onSubmit = async (data: RegistrationData) => {
    console.log('Final data:', data)
    // Submit to API
  }

  return (
    <div>
      <div>
        Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {currentStep === 0 && (
          <>
            <input {...register('email')} placeholder="Email" />
            {errors.email && <span>{errors.email.message}</span>}
            
            <input {...register('password')} type="password" placeholder="Password" />
            {errors.password && <span>{errors.password.message}</span>}
          </>
        )}

        {currentStep === 1 && (
          <>
            <input {...register('firstName')} placeholder="First Name" />
            {errors.firstName && <span>{errors.firstName.message}</span>}
            
            <input {...register('lastName')} placeholder="Last Name" />
            {errors.lastName && <span>{errors.lastName.message}</span>}
          </>
        )}

        {currentStep === 2 && (
          <>
            <input {...register('address')} placeholder="Address" />
            {errors.address && <span>{errors.address.message}</span>}
            
            <input {...register('city')} placeholder="City" />
            {errors.city && <span>{errors.city.message}</span>}
            
            <input {...register('zipCode')} placeholder="Zip Code" />
            {errors.zipCode && <span>{errors.zipCode.message}</span>}
          </>
        )}

        <div>
          {currentStep > 0 && (
            <button type="button" onClick={prevStep}>
              Previous
            </button>
          )}
          
          {currentStep < steps.length - 1 ? (
            <button type="button" onClick={nextStep}>
              Next
            </button>
          ) : (
            <button type="submit">Submit</button>
          )}
        </div>
      </form>
    </div>
  )
}
```

### Dynamic Fields (Field Array)

```typescript
'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const phoneSchema = z.object({
  type: z.enum(['mobile', 'home', 'work']),
  number: z.string().regex(/^\d{10}$/, 'Invalid phone number'),
})

const contactSchema = z.object({
  name: z.string().min(2),
  phones: z.array(phoneSchema).min(1, 'At least one phone required'),
})

type ContactFormData = z.infer<typeof contactSchema>

export const DynamicFieldForm = () => {
  const { register, control, handleSubmit, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      phones: [{ type: 'mobile', number: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'phones',
  })

  const onSubmit = (data: ContactFormData) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} placeholder="Name" />
      {errors.name && <span>{errors.name.message}</span>}

      <div>
        <h3>Phone Numbers</h3>
        {fields.map((field, index) => (
          <div key={field.id}>
            <select {...register(`phones.${index}.type`)}>
              <option value="mobile">Mobile</option>
              <option value="home">Home</option>
              <option value="work">Work</option>
            </select>

            <input
              {...register(`phones.${index}.number`)}
              placeholder="Phone number"
            />

            {errors.phones?.[index]?.number && (
              <span>{errors.phones[index]?.number?.message}</span>
            )}

            <button type="button" onClick={() => remove(index)}>
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => append({ type: 'mobile', number: '' })}
        >
          Add Phone
        </button>
      </div>

      <button type="submit">Submit</button>
    </form>
  )
}
```

### File Upload Form

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const fileSchema = z.object({
  title: z.string().min(2),
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, 'File is required')
    .refine((files) => files[0]?.size <= MAX_FILE_SIZE, 'Max file size is 5MB')
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files[0]?.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported'
    ),
})

type FileFormData = z.infer<typeof fileSchema>

export const FileUploadForm = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FileFormData>({
    resolver: zodResolver(fileSchema),
  })

  const file = watch('file')

  const onSubmit = async (data: FileFormData) => {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('file', data.file[0])

    // Upload to API
    await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} placeholder="Title" />
      {errors.title && <span>{errors.title.message}</span>}

      <input type="file" {...register('file')} accept="image/*" />
      {errors.file && <span>{errors.file.message as string}</span>}

      {file?.[0] && (
        <div>
          <p>Selected: {file[0].name}</p>
          <p>Size: {(file[0].size / 1024).toFixed(2)} KB</p>
        </div>
      )}

      <button type="submit">Upload</button>
    </form>
  )
}
```

## Formik + Yup Pattern

**Schema**:
```typescript
import * as Yup from 'yup'

export const userValidationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  age: Yup.number()
    .min(18, 'Must be at least 18')
    .optional(),
})
```

**Component**:
```typescript
'use client'

import { Formik, Form, Field, ErrorMessage } from 'formik'
import { userValidationSchema } from '@/schemas/user-schema'

export const UserFormFormik = () => {
  return (
    <Formik
      initialValues={{ name: '', email: '', age: undefined }}
      validationSchema={userValidationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        await submitForm(values)
        setSubmitting(false)
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <div>
            <label htmlFor="name">Name</label>
            <Field id="name" name="name" type="text" />
            <ErrorMessage name="name" component="div" />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <Field id="email" name="email" type="email" />
            <ErrorMessage name="email" component="div" />
          </div>

          <button type="submit" disabled={isSubmitting}>
            Submit
          </button>
        </Form>
      )}
    </Formik>
  )
}
```

## Common Validation Patterns

### Email Validation
```typescript
email: z.string().email('Invalid email')
// or more strict
email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email')
```

### Phone Number
```typescript
phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
// US format
usPhone: z.string().regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)
```

### Password
```typescript
password: z.string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase')
  .regex(/[a-z]/, 'Must contain lowercase')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character')
```

### URL
```typescript
website: z.string().url('Invalid URL')
```

### Date
```typescript
birthDate: z.date().max(new Date(), 'Birth date cannot be in future')
// or string date
birthDateStr: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
```

### Custom Validation
```typescript
username: z.string().refine(
  async (value) => {
    const exists = await checkUsernameExists(value)
    return !exists
  },
  { message: 'Username already taken' }
)
```

## Form Generation Workflow

### Step 1: Gather Requirements

Ask:
1. What fields does the form need?
2. What validation rules for each field?
3. Is it a single step or multi-step?
4. Any dynamic fields (add/remove)?
5. File uploads needed?
6. What happens on submit? (API call, navigation)

### Step 2: Generate Validation Schema

Create Zod/Yup schema with:
- Field types (string, number, date, etc.)
- Validation rules (min, max, regex, custom)
- Error messages
- Refinements for cross-field validation

### Step 3: Generate Form Component

Create component with:
- Form setup (useForm/Formik)
- Field registrations
- Error displays
- Submit handler
- Loading states

### Step 4: Add UI Layer

Adapt to project's UI library:
- Native HTML inputs
- Material-UI components
- Ant Design components
- Custom design system

### Step 5: Add Enhancements

- Success/error toasts
- Reset after submit
- Autosave (draft)
- Progress indicator (multi-step)
- Accessibility (ARIA labels)

## Best Practices

1. **Type Safety**: Always infer types from validation schema
2. **Error Messages**: Clear, actionable error messages
3. **Accessibility**: Proper labels, ARIA attributes, keyboard navigation
4. **Loading States**: Disable submit during submission
5. **Reset**: Reset form after successful submission
6. **Validation Mode**: Use `onBlur` for better UX
7. **Default Values**: Provide sensible defaults
8. **Field Arrays**: Use for dynamic lists
9. **Optimistic UI**: Show immediate feedback
10. **Error Boundaries**: Catch and handle form errors

## Tips for Success

- Start with validation schema first
- Use TypeScript inference for type safety
- Match UI library patterns
- Add loading/success/error states
- Test validation rules thoroughly
- Consider accessibility from start
- Add helpful error messages
- Use field arrays for dynamic content
- Implement proper file validation
- Add autosave for long forms

Remember: Forms are the primary way users interact with your app. Make them intuitive, fast, and forgiving.
