declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: TokenClientConfig) => TokenClient
        }
      }
    }
  }
}

interface TokenClientConfig {
  client_id: string
  scope: string
  callback: (response: TokenResponse) => void
}

interface TokenClient {
  callback: (response: TokenResponse) => void
  requestAccessToken: (options?: { prompt?: string }) => void
}

interface TokenResponse {
  access_token: string
  error?: string
  error_description?: string
}

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file'

let tokenClient: TokenClient | null = null
let accessToken: string | null = null

function loadGISScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Not in browser environment'))
      return
    }
    if (window.google?.accounts) {
      resolve()
      return
    }
    const existing = document.getElementById('gis-script')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      return
    }
    const script = document.createElement('script')
    script.id = 'gis-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })
}

export async function initGoogleDriveClient(): Promise<void> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  if (!clientId) {
    throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable is not set')
  }

  await loadGISScript()

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: DRIVE_SCOPE,
    callback: () => {},
  })
}

export function requestDriveAccess(): Promise<string> {
  if (!tokenClient) {
    return Promise.reject(new Error('Google Drive client not initialized. Call initGoogleDriveClient() first.'))
  }

  return new Promise((resolve, reject) => {
    tokenClient!.callback = (response: TokenResponse) => {
      if (response.error) {
        reject(new Error(response.error_description || response.error))
        return
      }
      accessToken = response.access_token
      resolve(response.access_token)
    }

    tokenClient!.requestAccessToken({ prompt: 'consent' })
  })
}

export async function uploadInvoiceToDrive(
  blob: Blob,
  filename: string,
  token: string,
): Promise<{ id: string; webViewLink: string }> {
  const metadata = {
    name: filename,
    mimeType: 'application/pdf',
  }

  const form = new FormData()
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
  )
  form.append('file', blob, filename)

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    },
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`)
  }

  return response.json()
}

export function getStoredAccessToken(): string | null {
  return accessToken
}

export function clearAccessToken(): void {
  accessToken = null
}
