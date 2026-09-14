---
name: replicate-models
description: Expert guidance for getting high-quality results from AI models on Replicate. Use when you need to craft effective prompts, optimize model parameters, and achieve professional-grade outputs from image generation, language models, audio processing, and other AI models.
---

# Replicate Models Skill

Expert guidance for getting high-quality results from AI models on Replicate. Use when you need to craft effective prompts, optimize model parameters, and achieve professional-grade outputs from image generation, language models, audio processing, and other AI models.

## When to Use This Skill

- Generating images with SDXL, Flux, or Stable Diffusion models
- Running language models (Llama, Mistral, etc.) for text generation
- Audio/video processing and generation
- Getting consistent, high-quality outputs from AI models
- Understanding model-specific parameters and prompting techniques
- Troubleshooting poor quality outputs
- Iterating and refining prompts for better results

## Common Queries

These are examples of questions that activate this skill:

1. "Generate an image using SDXL with this prompt"
2. "Create a product mockup with AI image generation"
3. "Run Flux to generate a photorealistic portrait"
4. "How do I improve my image generation prompts?"
5. "Generate marketing visuals for my product"
6. "Create an illustration in watercolor style"
7. "What parameters should I use for SDXL?"
8. "Generate multiple variations of this image concept"

## Tool Discovery

**Replicate uses DYNAMIC TOOLS mode (`--tools=dynamic`).** This means endpoints are discovered and invoked through three meta-tools, NOT direct tool names.

### The Three Dynamic Tools

1. **`list_api_endpoints`** - Discover available API endpoints
2. **`get_api_endpoint_schema`** - Get the parameter schema for an endpoint
3. **`invoke_api_endpoint`** - Call an endpoint with arguments

### CRITICAL: Correct Parameter Format

**The `invoke_api_endpoint` tool requires this EXACT format:**

```javascript
mcp__mcp-proxy__call_tool({
  tool_name: "invoke_api_endpoint",
  arguments: {
    endpoint_name: "search_models",  // The endpoint to call
    args: {                          // The actual endpoint arguments
      body: "flux image generation"
    }
  }
})
```

**WRONG formats that will fail:**
```javascript
// WRONG: Using "endpoint" instead of "endpoint_name"
{ endpoint: "search_models", args: {...} }

// WRONG: Passing args at top level
{ endpoint_name: "search_models", body: "flux" }

// WRONG: Using direct tool names (they don't exist in dynamic mode)
mcp__mcp-proxy__call_tool({ tool_name: "search_models", arguments: {...} })
```

### Step-by-Step Discovery Process

**Step 1: List available endpoints**

```javascript
mcp__mcp-proxy__call_tool({
  tool_name: "list_api_endpoints",
  arguments: {
    search_query: "predictions"  // Optional filter
  }
})
```

**Step 2: Get endpoint schema (to see required parameters)**

```javascript
mcp__mcp-proxy__call_tool({
  tool_name: "get_api_endpoint_schema",
  arguments: {
    endpoint: "create_predictions"
  }
})
```

**Step 3: Invoke the endpoint**

```javascript
mcp__mcp-proxy__call_tool({
  tool_name: "invoke_api_endpoint",
  arguments: {
    endpoint_name: "create_predictions",
    args: {
      version: "model-version-id",
      input: { prompt: "..." }
    }
  }
})
```

### Quick Reference Table

| Action | Tool | Arguments |
|--------|------|-----------|
| Search endpoints | `list_api_endpoints` | `{ search_query: "optional filter" }` |
| Get schema | `get_api_endpoint_schema` | `{ endpoint: "endpoint_name" }` |
| Call endpoint | `invoke_api_endpoint` | `{ endpoint_name: "...", args: {...} }` |

## Research Workflow - Finding the Right Model

**CRITICAL: Always use EXA research for model research, NOT WebSearch.**

When you need to find or research Replicate models:

1. **Use EXA MCP for research:**
   ```javascript
   Skill("exa-research")
   // Then search for: "Replicate image outpainting extension models 2025"
   ```

2. **Then search Replicate's catalog via proxy:**
   ```javascript
   mcp__mcp-proxy__call_tool({
     tool_name: "invoke_api_endpoint",
     arguments: {
       endpoint_name: "search_models",
       args: { body: "outpainting image extension" }
     }
   })
   ```

3. **Get specific model details:**
   ```javascript
   mcp__mcp-proxy__call_tool({
     tool_name: "invoke_api_endpoint",
     arguments: {
       endpoint_name: "get_models",
       args: { model_owner: "owner", model_name: "model-name" }
     }
   })
   ```

**Why EXA over WebSearch:**
- Provides neural/semantic understanding beyond keyword matching
- Better at finding current model versions and comparisons
- Includes community insights and detailed technical information
- More accurate for technical AI/ML research

**Only fall back to WebSearch if:**
- EXA MCP is not available in the current session
- User explicitly requests WebSearch

## Available API Endpoints

Replicate runs in **dynamic mode**, providing three meta-tools to access all endpoints:

| Meta-Tool | Purpose |
|-----------|---------|
| `list_api_endpoints` | Discover all available API endpoints |
| `get_api_endpoint_schema` | Get parameter schema for any endpoint |
| `invoke_api_endpoint` | Call any endpoint with arguments |

**Common endpoints** (invoke via `invoke_api_endpoint`):
- `search_models` - Find models by capability
- `get_models` - Get model details and examples
- `create_predictions` - Run a model with inputs
- `get_predictions` - Check prediction status
- `create_models_predictions` - Run official models
- `list_predictions` - List all predictions

## Core Principles

### 1. Understanding Model Capabilities and Limitations

Before crafting prompts, understand what each model does well and poorly.

**Image Generation Models (SDXL, Flux, Stable Diffusion):**
- Excel at: Photorealistic images, artistic styles, compositions, specific subjects
- Struggle with: Text in images, precise anatomy, complex physics, exact counts
- Best for: Marketing visuals, concept art, illustrations, product mockups

**Language Models (Llama, Mistral, etc.):**
- Excel at: Explanations, summaries, creative writing, code generation, Q&A
- Struggle with: Real-time data, complex math without tools, very long outputs
- Best for: Content generation, analysis, coding assistance, research

**Audio Models:**
- Excel at: Music generation, sound effects, voice synthesis, audio cleanup
- Struggle with: Precise timing, complex multi-track arrangements
- Best for: Background music, sound design, voiceovers

### 2. Effective Prompt Engineering

**Image Generation Prompts:**

The quality of image outputs depends heavily on prompt structure. Use this formula:

```
[Subject] + [Style/Medium] + [Composition] + [Lighting] + [Quality Modifiers] + [Negative Prompt]
```

**Good Prompt Example:**
```
a serene mountain landscape at golden hour, oil painting style,
wide-angle vista with lake in foreground, dramatic clouds,
soft warm lighting, highly detailed, 8k resolution, masterpiece

Negative: blurry, low quality, distorted, ugly, amateur
```

**Poor Prompt:**
```
mountain picture
```

**Prompt Best Practices:**

1. **Be Specific About Style:**
   - "photorealistic portrait"
   - "watercolor illustration"
   - "isometric pixel art"
   - "cinematic 3D render"

2. **Describe Composition:**
   - "close-up shot"
   - "wide-angle vista"
   - "bird's eye view"
   - "rule of thirds composition"

3. **Specify Lighting:**
   - "golden hour lighting"
   - "dramatic rim lighting"
   - "soft diffused light"
   - "neon lighting at night"

4. **Add Quality Modifiers:**
   - "highly detailed"
   - "8k resolution"
   - "sharp focus"
   - "professional photography"

5. **Use Negative Prompts:**
   - List what you DON'T want
   - Common: "blurry, distorted, low quality, watermark, text"
   - Model-specific issues: "extra fingers, deformed hands" (for people)

**Language Model Prompts:**

Structure prompts for clarity and specificity:

**Good Prompt:**
```
Write a professional email to a client explaining a project delay.
The delay is 2 weeks due to unexpected technical challenges.
Tone should be apologetic but confident.
Include proposed solutions and revised timeline.
Length: 150-200 words.
```

**Poor Prompt:**
```
write an email about delay
```

**Language Model Best Practices:**

1. **Specify Format:**
   - "Write a bullet-point list..."
   - "Create a table with columns..."
   - "Format as JSON with fields..."
   - "Write in markdown format..."

2. **Set Tone and Style:**
   - "Professional and formal"
   - "Casual and friendly"
   - "Technical and precise"
   - "Creative and engaging"

3. **Provide Context:**
   - Background information
   - Target audience
   - Purpose/goal
   - Constraints

4. **Control Length:**
   - "In 100 words or less..."
   - "Write a detailed 500-word..."
   - "Provide 3-5 examples..."

5. **Request Structured Output:**
   - "List 5 key points..."
   - "Create 3 sections: intro, body, conclusion..."
   - "Provide step-by-step instructions..."

### 3. Critical Parameters That Affect Output Quality

**Image Generation Parameters:**

**Guidance Scale (CFG Scale: 1-20):**
- **Low (1-5):** More creative, less adherent to prompt
- **Medium (7-10):** Balanced (recommended starting point)
- **High (15-20):** Strictly follows prompt, may look over-processed

Start at 7-8, increase if output doesn't match prompt, decrease if output looks artificial.

**Steps (20-150):**
- **Low (20-30):** Faster, less detailed
- **Medium (50-80):** Good quality-to-speed ratio (recommended)
- **High (100-150):** Maximum detail, diminishing returns

Start at 50, increase only if you need more refinement.

**Seed (random or fixed number):**
- **Random:** Different output each time
- **Fixed:** Reproducible results for iteration

Use fixed seed when iterating on a prompt to see isolated effects of changes.

**Aspect Ratio:**
- Match intended use case (1:1 for social, 16:9 for video thumbnail, etc.)
- Some models work better at native resolutions (1024x1024 for SDXL)

**Negative Prompt (critical for quality):**
Always include basic quality filters:
```
blurry, low quality, distorted, amateur, watermark, text, signature
```

Add model-specific issues:
- Portraits: "extra fingers, deformed hands, asymmetric eyes"
- Landscapes: "oversaturated, unnatural colors, lens distortion"

**Language Model Parameters:**

**Temperature (0.0-1.0):**
- **Low (0.1-0.3):** Deterministic, focused, factual
- **Medium (0.5-0.7):** Balanced creativity and coherence
- **High (0.8-1.0):** Creative, diverse, potentially inconsistent

Use low for factual content, medium for general writing, high for creative fiction.

**Max Tokens (output length):**
- Set to expected output length + 20% buffer
- Too low: truncated outputs
- Too high: wasted time and cost

**Top P / Top K (sampling parameters):**
- **Top P (0.1-1.0):** Nucleus sampling
- **Top K (1-100):** Limits choices to top K tokens

Defaults usually work well. Adjust only if outputs are too random or too repetitive.

**System Prompt:**
Set the model's behavior context:
```
You are an expert technical writer creating documentation for developers.
Use clear, concise language with practical examples.
Avoid jargon unless necessary.
```

### 4. Iterative Refinement Process

**Step 1: Start with a Basic Prompt**
```
a cat sitting on a windowsill
```

**Step 2: Add Style and Medium**
```
a cat sitting on a windowsill, watercolor painting, soft pastel colors
```

**Step 3: Enhance Composition and Details**
```
a fluffy orange cat sitting on a wooden windowsill, watercolor painting,
soft pastel colors, morning sunlight streaming through lace curtains,
peaceful atmosphere, close-up view
```

**Step 4: Add Quality Modifiers and Negative Prompt**
```
a fluffy orange cat sitting on a wooden windowsill, watercolor painting,
soft pastel colors, morning sunlight streaming through lace curtains,
peaceful atmosphere, close-up view, highly detailed, professional illustration,
soft focus background

Negative: blurry, low quality, distorted, dark, gloomy, scary
```

**Step 5: Tune Parameters**
- If not matching prompt: Increase guidance scale to 10
- If looking over-processed: Decrease to 6
- If not detailed enough: Increase steps to 75
- Fix seed to iterate on just the prompt

### 5. Model-Specific Best Practices

**SDXL (Stable Diffusion XL):**
- Native resolution: 1024x1024 (works best)
- Strengths: Photorealism, detailed textures, coherent compositions
- Prompting: Very responsive to detailed descriptions
- Common issue: Can struggle with multiple subjects, use weight syntax

**Flux:**
- Newer, more capable than SDXL
- Strengths: Better text rendering, complex scenes, style consistency
- Prompting: Natural language works well, less need for keyword stuffing
- Parameters: Generally needs fewer steps than SDXL (30-50)

**Llama Models:**
- Context length: Check model documentation (usually 4K-32K tokens)
- Strengths: Instruction following, reasoning, code generation
- Prompting: Use clear instruction format with examples
- System prompts: Very effective for setting behavior

**Mistral Models:**
- Similar to Llama but often faster
- Strengths: Concise outputs, efficiency, multilingual
- Prompting: Works well with structured formats (markdown, JSON)

### 6. Troubleshooting Poor Quality Outputs

**Problem: Output doesn't match prompt**
- **Solution:** Increase guidance scale
- **Solution:** Add more specific details to prompt
- **Solution:** Use negative prompt to exclude unwanted elements
- **Solution:** Check examples on model page to verify capability

**Problem: Output looks artificial or over-processed**
- **Solution:** Decrease guidance scale
- **Solution:** Reduce steps
- **Solution:** Simplify prompt (remove excessive quality modifiers)

**Problem: Inconsistent outputs**
- **Solution:** Fix seed value
- **Solution:** Lower temperature (for language models)
- **Solution:** Increase guidance scale (for image models)

**Problem: Specific elements are wrong (hands, faces, text)**
- **Solution:** Use specialized models (some models are trained specifically for anatomy)
- **Solution:** Add corrections to negative prompt
- **Solution:** Generate multiple outputs and select best (varies seed)

**Problem: Output is blurry or low quality**
- **Solution:** Increase steps
- **Solution:** Verify aspect ratio matches model's native resolution
- **Solution:** Add quality modifiers to prompt
- **Solution:** Check if model supports upscaling option

## Common Patterns

### Pattern 1: Marketing Image Generation

```javascript
mcp__mcp-proxy__call_tool({
  tool_name: "invoke_api_endpoint",
  arguments: {
    endpoint_name: "create_predictions",
    args: {
      version: "sdxl-version-id",
      input: {
        prompt: `professional product photography of a modern smartwatch,
        studio lighting, white background, 45-degree angle,
        sharp focus on watch face, shallow depth of field,
        commercial photography, high resolution, clean aesthetic`,
        negative_prompt: "blurry, low quality, cluttered, busy background",
        guidance_scale: 8,
        num_inference_steps: 50,
        width: 1024,
        height: 1024
      }
    }
  }
})
```

### Pattern 2: Creative Illustration

```javascript
mcp__mcp-proxy__call_tool({
  tool_name: "invoke_api_endpoint",
  arguments: {
    endpoint_name: "create_predictions",
    args: {
      version: "flux-version-id",
      input: {
        prompt: `whimsical forest scene with glowing mushrooms,
        fantasy illustration style, vibrant colors,
        mysterious atmosphere, soft ethereal lighting,
        detailed foliage, magical ambiance, storybook art`,
        guidance_scale: 7,
        num_inference_steps: 40,
        aspect_ratio: "16:9"
      }
    }
  }
})
```

### Pattern 3: Technical Documentation

```javascript
mcp__mcp-proxy__call_tool({
  tool_name: "invoke_api_endpoint",
  arguments: {
    endpoint_name: "create_predictions",
    args: {
      version: "llama-version-id",
      input: {
        prompt: `Write technical documentation for a REST API endpoint.

Endpoint: POST /api/users
Purpose: Create a new user account
Parameters:
- email (required): User's email address
- password (required): User's password
- name (optional): User's display name

Include: endpoint description, parameters table, example request/response, error codes.
Format: Markdown with code blocks.`,
        max_tokens: 1000,
        temperature: 0.3  // Low for factual, technical content
      }
    }
  }
})
```

### Pattern 4: Iterative Prompt Refinement

```javascript
// Start with fixed seed for consistency
const seed = 12345;

// Version 1: Basic
const v1 = await mcp__mcp-proxy__call_tool({
  tool_name: "invoke_api_endpoint",
  arguments: {
    endpoint_name: "create_predictions",
    args: {
      version: "model-id",
      input: { prompt: "a robot in a city", seed: seed }
    }
  }
})

// Version 2: Add style
const v2 = await mcp__mcp-proxy__call_tool({
  tool_name: "invoke_api_endpoint",
  arguments: {
    endpoint_name: "create_predictions",
    args: {
      version: "model-id",
      input: { prompt: "a friendly robot in a futuristic city, cyberpunk style", seed: seed }
    }
  }
})

// Version 3: Refine details
const v3 = await mcp__mcp-proxy__call_tool({
  tool_name: "invoke_api_endpoint",
  arguments: {
    endpoint_name: "create_predictions",
    args: {
      version: "model-id",
      input: {
        prompt: `a friendly robot waving in a futuristic neon-lit city,
        cyberpunk style, raining at night, reflective streets,
        cinematic composition, atmospheric lighting`,
        negative_prompt: "scary, menacing, dark, aggressive",
        seed: seed
      }
    }
  }
})
```

## Quality Checklist

Before finalizing outputs, verify:

**For Images:**
- [ ] Prompt includes subject, style, composition, lighting
- [ ] Negative prompt excludes common quality issues
- [ ] Guidance scale is appropriate (7-10 for most cases)
- [ ] Steps are sufficient (50+ for quality)
- [ ] Aspect ratio matches intended use
- [ ] Generated multiple variations (different seeds) and selected best

**For Text:**
- [ ] Prompt includes format, tone, length, context
- [ ] Temperature matches content type (low for facts, high for creativity)
- [ ] Max tokens allows complete output
- [ ] System prompt sets appropriate behavior
- [ ] Output format is specified (markdown, JSON, etc.)

## Advanced Techniques

### Prompt Weighting (for compatible models)

Emphasize or de-emphasize parts of prompt:

```
(mountain:1.5) landscape with (lake:0.8)
```
- Values >1.0 emphasize
- Values <1.0 de-emphasize

### Prompt Scheduling (for some models)

Change prompts mid-generation:

```
[forest scene:mountain scene:0.5]
```
- Starts with forest, transitions to mountain at 50% completion

### Using Reference Images (img2img)

For models that support it:
```javascript
input: {
  prompt: "transform into oil painting style",
  image: "https://example.com/reference.jpg",
  strength: 0.7  // How much to transform (0.0-1.0)
}
```

### Controlnet (for supported models)

Guide generation with structural input:
```javascript
input: {
  prompt: "modern living room",
  control_image: "edge_map.jpg",  // Edges, pose, depth, etc.
  controlnet_conditioning_scale: 0.8
}
```

## Tool Search Tool Integration

When the Replicate MCP server has `defer_loading: true` configured, tools are discovered on-demand using the Tool Search Tool. This reduces initial token usage while maintaining full functionality.

**How it works:**
1. All Replicate tools are deferred by default (discovered when needed)
2. Claude searches for tools by name and description
3. Matching tools are loaded into context on-demand

**Configuration in `.mcp.json`:**
```json
{
  "mcpServers": {
    "replicate": {
      "command": "npx",
      "args": ["-y", "replicate-mcp"],
      "env": {
        "REPLICATE_API_TOKEN": "${REPLICATE_API_TOKEN}"
      },
      "default_config": {
        "defer_loading": true
      }
    }
  }
}
```

**No workflow changes required** - tool discovery happens automatically. The only difference is reduced initial token usage (~85% reduction with multiple MCP servers).

**Learn more:** See `docs/deferred-mcp-loading.md` for comprehensive guide.

## Integration with Other Skills

**Combine with exa-research:**
- **ALWAYS start here** when researching models or capabilities
- Research current trends in prompting techniques
- Find model comparisons and community feedback
- Discover new models and features

**Combine with v0-ui-generator:**
Generate UI mockups or product images for components.

**Combine with task-maker:**
Create tasks for integrating generated content into applications.

## Success Metrics

High-quality outputs demonstrate:
- Clear adherence to prompt description
- Professional-grade visual/textual quality
- Consistency across multiple generations (when desired)
- Appropriate detail level for intended use
- Free from common model artifacts (distortions, errors)

Remember: Great prompts are specific, descriptive, and iteratively refined. Start simple, add details, and tune parameters based on results.
