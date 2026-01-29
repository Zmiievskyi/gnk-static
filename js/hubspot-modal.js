/**
 * HubSpot Modal - Form Integration
 * Handles modal display and HubSpot form embedding with pre-population
 */

(function initHubSpotModal() {
  'use strict';

  // ============================================================================
  // Configuration
  // ============================================================================

  const HUBSPOT_CONFIG = {
    portalId: '147554099',
    formId: '78fd550b-eec3-4958-bc4d-52c73924b87b',
    region: 'eu1',                         // 'eu1' or 'na1'
    fieldName: 'form_gonka_preffered_configuration', // HubSpot internal field name
    scriptTimeout: 10000,                  // 10 seconds
  };

  const GPU_DISPLAY_NAMES = {
    A100: '8 x A100',
    H100: '8 x H100',
    H200: '8 x H200',
    B200: '8 x B200',
  };

  // ============================================================================
  // State Management
  // ============================================================================

  let state = {
    scriptLoaded: false,
    scriptLoading: false,
    formLoaded: false,
    originalUrl: null,
    currentGpuType: null,
  };

  // ============================================================================
  // DOM References
  // ============================================================================

  const elements = {
    modal: null,
    modalSubtitle: null,
    closeButton: null,
    formContainer: null,
    loadingState: null,
    errorState: null,
  };

  // ============================================================================
  // Utility Functions
  // ============================================================================

  /**
   * Shows a specific state in the modal body
   * @param {'loading'|'form'|'error'} stateType - Which state to show
   */
  function showState(stateType) {
    if (!elements.formContainer || !elements.loadingState || !elements.errorState) return;

    // Hide all states first
    elements.formContainer.classList.remove('visible');
    elements.loadingState.classList.add('hidden');
    elements.errorState.style.display = 'none';

    // Show requested state
    switch (stateType) {
      case 'loading':
        elements.loadingState.classList.remove('hidden');
        break;
      case 'form':
        elements.formContainer.classList.add('visible');
        break;
      case 'error':
        elements.errorState.style.display = 'flex';
        break;
    }
  }

  /**
   * Gets the appropriate HubSpot script URL based on region
   * @returns {string} Script URL
   */
  function getScriptUrl() {
    // Use the embed script (iframe method) instead of v2 API
    return `https://js-${HUBSPOT_CONFIG.region}.hsforms.net/forms/embed/${HUBSPOT_CONFIG.portalId}.js`;
  }

  /**
   * Generates a unique container ID for the HubSpot form
   * @returns {string} Unique container ID
   */
  function generateContainerId() {
    return `hubspot-form-${Date.now()}`;
  }

  // ============================================================================
  // URL Parameter Management
  // ============================================================================

  /**
   * Adds URL parameters for form pre-population (must be done BEFORE form loads)
   * @param {Object} values - Key-value pairs to add as URL parameters
   */
  function addUrlParams(values) {
    if (state.originalUrl === null) {
      state.originalUrl = window.location.href;
    }

    try {
      const url = new URL(window.location.href);

      for (const [key, value] of Object.entries(values)) {
        url.searchParams.set(key, value);
      }

      window.history.replaceState({}, '', url.toString());
    } catch (error) {
      console.warn('[HubSpot Modal] Failed to add URL params:', error.message);
    }
  }

  /**
   * Removes URL parameters and restores original URL
   */
  function removeUrlParams() {
    if (state.originalUrl) {
      try {
        window.history.replaceState({}, '', state.originalUrl);
        state.originalUrl = null;
      } catch (error) {
        console.warn('[HubSpot Modal] Failed to restore URL:', error.message);
      }
    }
  }

  // ============================================================================
  // HubSpot Script Loading
  // ============================================================================

  /**
   * Dynamically loads the HubSpot forms script
   * @returns {Promise<void>}
   */
  function loadHubSpotScript() {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      const existingScript = document.querySelector(`script[src*="hsforms.net"]`);
      if (existingScript || window.hbspt?.forms) {
        state.scriptLoaded = true;
        resolve();
        return;
      }

      // Check if already loading
      if (state.scriptLoading) {
        waitForHubSpotReady(resolve, reject);
        return;
      }

      state.scriptLoading = true;

      const script = document.createElement('script');
      script.src = getScriptUrl();
      script.defer = true;

      // Timeout handler
      const timeoutId = setTimeout(() => {
        if (!state.scriptLoaded) {
          state.scriptLoading = false;
          reject(new Error('Script load timeout'));
        }
      }, HUBSPOT_CONFIG.scriptTimeout);

      script.onload = () => {
        clearTimeout(timeoutId);
        state.scriptLoaded = true;
        state.scriptLoading = false;
        resolve();
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        state.scriptLoading = false;
        reject(new Error('Script load failed'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Waits for window.hbspt.forms to be available with retry logic
   * @param {Function} resolve - Promise resolve callback
   * @param {Function} reject - Promise reject callback
   */
  function waitForHubSpotReady(resolve, reject) {
    const maxRetries = 30; // 3 seconds total
    const retryInterval = 100; // 100ms
    let attempts = 0;

    const checkReady = () => {
      if (window.hbspt?.forms) {
        state.scriptLoaded = true;
        state.scriptLoading = false;
        resolve();
        return;
      }

      attempts++;
      if (attempts >= maxRetries) {
        state.scriptLoading = false;
        reject(new Error('HubSpot forms API not available'));
        return;
      }

      setTimeout(checkReady, retryInterval);
    };

    checkReady();
  }

  // ============================================================================
  // Form Loading
  // ============================================================================

  /**
   * Loads the HubSpot form into the container using iframe embed method
   */
  function loadForm() {
    if (!elements.formContainer) {
      console.error('[HubSpot Modal] Form container not found');
      showState('error');
      return;
    }

    console.info('[HubSpot Modal] Creating form with iframe embed method:', {
      region: HUBSPOT_CONFIG.region,
      portalId: HUBSPOT_CONFIG.portalId,
      formId: HUBSPOT_CONFIG.formId,
    });

    // Clear any existing form content
    elements.formContainer.innerHTML = '';

    // Create the hs-form-frame div (iframe embed method)
    const formFrame = document.createElement('div');
    formFrame.className = 'hs-form-frame';
    formFrame.setAttribute('data-region', HUBSPOT_CONFIG.region);
    formFrame.setAttribute('data-portal-id', HUBSPOT_CONFIG.portalId);
    formFrame.setAttribute('data-form-id', HUBSPOT_CONFIG.formId);

    elements.formContainer.appendChild(formFrame);

    // Poll for iframe creation with timeout
    const maxAttempts = 30; // 30 * 200ms = 6 seconds max
    let attempts = 0;

    const checkForIframe = () => {
      attempts++;
      const iframe = formFrame.querySelector('iframe');

      if (iframe) {
        state.formLoaded = true;
        showState('form');
        console.info('[HubSpot Modal] Form iframe loaded after', attempts * 200, 'ms');
        return;
      }

      if (attempts >= maxAttempts) {
        console.error('[HubSpot Modal] Form iframe failed to load after', maxAttempts * 200, 'ms');
        showState('error');
        return;
      }

      setTimeout(checkForIframe, 200);
    };

    // Start checking after initial delay for script to initialize
    setTimeout(checkForIframe, 200);
  }

  // ============================================================================
  // Modal Control
  // ============================================================================

  /**
   * Opens the modal with pre-populated GPU configuration
   * @param {string} gpuType - GPU type (e.g., 'A100', 'H100')
   */
  function openModal(gpuType) {
    // Guard: no modal element or showModal not supported
    if (!elements.modal || typeof elements.modal.showModal !== 'function') {
      console.warn('[HubSpot Modal] Dialog element or showModal() not supported');
      return;
    }

    // Guard: modal already open (prevents double-click issues)
    if (elements.modal.open) {
      return;
    }

    state.currentGpuType = gpuType;
    const displayName = GPU_DISPLAY_NAMES[gpuType] || gpuType;

    // Update modal subtitle
    if (elements.modalSubtitle) {
      elements.modalSubtitle.textContent = displayName;
    }

    // Add URL parameters for pre-population (MUST happen BEFORE form loads)
    addUrlParams({
      [HUBSPOT_CONFIG.fieldName]: displayName,
    });

    // Show modal (wrapped in try/catch for edge cases)
    try {
      elements.modal.showModal();
    } catch (error) {
      console.error('[HubSpot Modal] Failed to open modal:', error);
      return;
    }
    showState('loading');

    // Load HubSpot script and form
    loadHubSpotScript()
      .then(() => {
        loadForm();
      })
      .catch((error) => {
        console.error('[HubSpot Modal] Script load failed:', error);
        showState('error');
      });
  }

  /**
   * Closes the modal and cleans up state
   */
  function closeModal() {
    if (!elements.modal) return;

    elements.modal.close();
    removeUrlParams();
    state.currentGpuType = null;
    state.formLoaded = false;

    // Reset to loading state for next open
    showState('loading');
  }

  // ============================================================================
  // Form Submission Detection
  // ============================================================================

  /**
   * Listens for HubSpot form submission via postMessage
   * HubSpot iframes send messages when forms are submitted
   */
  /**
   * Validates that an origin belongs to HubSpot
   * @param {string} origin - The message origin URL
   * @returns {boolean} True if origin is a valid HubSpot domain
   */
  function isValidHubSpotOrigin(origin) {
    try {
      const url = new URL(origin);
      const hostname = url.hostname;
      // Exact match or subdomain match (e.g., js-eu1.hsforms.net)
      return hostname === 'hsforms.net' ||
             hostname === 'hubspot.com' ||
             hostname.endsWith('.hsforms.net') ||
             hostname.endsWith('.hubspot.com');
    } catch {
      return false;
    }
  }

  function setupFormSubmissionListener() {
    window.addEventListener('message', (event) => {
      // Only process messages from valid HubSpot origins
      if (!isValidHubSpotOrigin(event.origin)) {
        return;
      }

      // HubSpot sends various message formats
      let data = event.data;

      // Handle string messages (older format)
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }

      // Check for form submission events
      const isSubmission = (
        data.type === 'hsFormCallback' && data.eventName === 'onFormSubmitted'
      ) || (
        data.meetingBookSucceeded === true
      ) || (
        data.type === 'hsFormCallback' && data.eventName === 'onFormSubmit'
      );

      if (isSubmission && elements.modal?.open) {
        console.info('[HubSpot Modal] Form submitted successfully');
        // Close modal after a short delay to show success state
        setTimeout(() => {
          closeModal();
        }, 1500);
      }
    });
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Handles clicks on "Rent Now" buttons
   * @param {Event} event - Click event
   */
  function handleRentButtonClick(event) {
    const button = event.target.closest('.btn-rent');
    if (!button) return;

    event.preventDefault();
    const gpuType = button.getAttribute('data-gpu-type');

    if (gpuType) {
      openModal(gpuType);
    }
  }

  /**
   * Handles clicks on modal backdrop (outside content)
   * @param {Event} event - Click event
   */
  function handleModalBackdropClick(event) {
    if (!elements.modal) return;

    const modalContent = elements.modal.querySelector('.modal-content');
    const rect = modalContent.getBoundingClientRect();
    const isInDialog = (
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width
    );

    if (!isInDialog) {
      closeModal();
    }
  }

  /**
   * Handles Escape key press (dialog handles this natively, but we need cleanup)
   */
  function handleEscapeKey() {
    if (!elements.modal) return;

    // Listen for dialog close event (triggered by Esc key)
    elements.modal.addEventListener('close', () => {
      removeUrlParams();
      state.currentGpuType = null;
      state.formLoaded = false;
    });
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initializes the modal and attaches event listeners
   */
  function init() {
    // Get DOM references
    elements.modal = document.getElementById('hubspot-modal');
    elements.modalSubtitle = document.getElementById('modal-subtitle');
    elements.closeButton = elements.modal?.querySelector('.modal-close');
    elements.formContainer = document.getElementById('hubspot-form-container');
    elements.loadingState = document.getElementById('hubspot-loading');
    elements.errorState = document.getElementById('hubspot-error');

    if (!elements.modal) {
      console.warn('[HubSpot Modal] Modal element not found');
      return;
    }

    // Event delegation for "Rent Now" buttons (dynamically generated)
    document.addEventListener('click', handleRentButtonClick);

    // Close button
    if (elements.closeButton) {
      elements.closeButton.addEventListener('click', closeModal);
    }

    // Backdrop click to close
    elements.modal.addEventListener('click', handleModalBackdropClick);

    // Escape key cleanup
    handleEscapeKey();

    // Listen for form submission via postMessage
    setupFormSubmissionListener();

    console.info('[HubSpot Modal] Initialized');
  }

  // ============================================================================
  // Run on DOM Ready
  // ============================================================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
