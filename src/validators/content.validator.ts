import { z } from 'zod';
import { zfd } from 'zod-form-data';

export const createContentSchema = zfd.formData({
    title: zfd.text(
        z.string().min(1, "Title is required")
    ),

    description: zfd.text(
        z.string().min(1, "Description is needed")
    ),

    language: zfd.text(
        z.enum(["english", "marathi", "hindi"])
    ),

    type: zfd.text(
        z.enum(["daily", "educational"])
    ),

    hidden: zfd.text(
        z.enum(["true", "false"])
    ).transform(v => v === "true"),

    file: zfd.file(), // VERY IMPORTANT
});

export const updateContentSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is needed"),
        language: z.enum(['english', 'marathi', 'hindi']),
        type: (z.enum(['daily', 'educational'])),
        hidden: z.enum(['true', 'false']).transform(val => val === 'true')
    }).partial()
})

// export const updateContentImageSchema = 