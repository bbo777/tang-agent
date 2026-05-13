const COMFYUI_URL = 'http://127.0.0.1:8188'
const POLL_INTERVAL = 1000
const TIMEOUT = 60000

interface WorkflowNode {
  inputs: Record<string, any>
  class_type: string
  [key: string]: any
}

interface Workflow {
  [key: string]: WorkflowNode
}

const BASE_WORKFLOW: Workflow = {
  "3": {
    "inputs": {
      "seed": 0,
      "steps": 20,
      "cfg": 8,
      "sampler_name": "euler",
      "scheduler": "normal",
      "denoise": 1,
      "model": ["4", 0],
      "positive": ["6", 0],
      "negative": ["7", 0],
      "latent_image": ["5", 0]
    },
    "class_type": "KSampler"
  },
  "4": {
    "inputs": {
      "ckpt_name": "v1-5-pruned-emaonly.ckpt"
    },
    "class_type": "CheckpointLoaderSimple"
  },
  "5": {
    "inputs": {
      "width": 512,
      "height": 512,
      "batch_size": 1
    },
    "class_type": "EmptyLatentImage"
  },
  "6": {
    "inputs": {
      "text": "",
      "clip": ["4", 1]
    },
    "class_type": "CLIPTextEncode"
  },
  "7": {
    "inputs": {
      "text": "text, watermark, ugly, blurry, low quality",
      "clip": ["4", 1]
    },
    "class_type": "CLIPTextEncode"
  },
  "8": {
    "inputs": {
      "samples": ["3", 0],
      "vae": ["4", 2]
    },
    "class_type": "VAEDecode"
  },
  "9": {
    "inputs": {
      "filename_prefix": "ComfyUI",
      "images": ["8", 0]
    },
    "class_type": "SaveImage"
  }
}

async function queuePrompt(workflow: Workflow): Promise<string> {
  const response = await fetch(`${COMFYUI_URL}/prompt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: workflow }),
  })

  if (!response.ok) {
    throw new Error(`Failed to queue prompt: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.prompt_id
}

async function getHistory(promptId: string): Promise<any> {
  const response = await fetch(`${COMFYUI_URL}/history/${promptId}`)
  if (!response.ok) {
    throw new Error(`Failed to get history: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

async function getImage(filename: string, subfolder: string, type: string): Promise<Uint8Array> {
  const params = new URLSearchParams({ filename, subfolder, type })
  const response = await fetch(`${COMFYUI_URL}/view?${params}`)
  if (!response.ok) {
    throw new Error(`Failed to get image: ${response.status} ${response.statusText}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  return new Uint8Array(arrayBuffer)
}

export async function generateWithComfyUI(prompt: string): Promise<Uint8Array> {
  const workflow = JSON.parse(JSON.stringify(BASE_WORKFLOW)) as Workflow
  workflow['6'].inputs.text = prompt
  workflow['3'].inputs.seed = Math.floor(Math.random() * 1000000000)

  const promptId = await queuePrompt(workflow)

  const startTime = Date.now()

  while (Date.now() - startTime < TIMEOUT) {
    const history = await getHistory(promptId)
    
    if (history[promptId]) {
      const outputs = history[promptId].outputs
      const saveImageNode = outputs['9']
      
      if (saveImageNode && saveImageNode.images && saveImageNode.images.length > 0) {
        const image = saveImageNode.images[0]
        return getImage(image.filename, image.subfolder, image.type)
      }
    }

    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))
  }

  throw new Error('Generation timeout')
}
