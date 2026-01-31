import { z } from "zod";

export const agentSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(50),
    description: z.string().min(10, "Description must be at least 10 characters").max(200),
    price: z.coerce.number().min(0.0001, "Price must be at least 0.0001 APT"),
    endpoint: z.string().url("Must be a valid URL").startsWith("http", "Must start with http/https"),
    category: z.string().min(1, "Please select a category"),
    // Image URL is generated or optional in UI, but good to have schema
    imageUrl: z.string().optional(),
});

export type AgentFormData = z.infer<typeof agentSchema>;
