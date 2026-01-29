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
    portalId: 'YOUR_PORTAL_ID',           // TODO: Replace with actual Portal ID
    formId: 'YOUR_FORM_ID',               // TODO: Replace with actual Form ID
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
    return `https://js${HUBSPOT_CONFIG.region === 'na1' ? '' : `-${HUBSPOT_CONFIG.region}`}.hsforms.net/forms/v2.js`;
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
      if (window.hbspt?.forms) {
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
      script.async = true;

      // Timeout handler
      const timeoutId = setTimeout(() => {
        if (!state.scriptLoaded) {
          state.scriptLoading = false;
          reject(new Error('Script load timeout'));
        }
      }, HUBSPOT_CONFIG.scriptTimeout);

      script.onload = () => {
        clearTimeout(timeoutId);
        waitForHubSpotReady(resolve, reject);
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
   * Loads the HubSpot form into the container
   */
  function loadForm() {
    if (!elements.formContainer) {
      showState('error');
      return;
    }

    // Clear any existing form content
    elements.formContainer.innerHTML = '';

    // Create unique container for this form instance
    const containerId = generateContainerId();
    const formDiv = document.createElement('div');
    formDiv.id = containerId;
    elements.formContainer.appendChild(formDiv);

    try {
      window.hbspt.forms.create({
        region: HUBSPOT_CONFIG.region,
        portalId: HUBSPOT_CONFIG.portalId,
        formId: HUBSPOT_CONFIG.formId,
        target: `#${containerId}`,
        onFormReady: function() {
          state.formLoaded = true;
          showState('form');
          console.info('[HubSpot Modal] Form loaded successfully');
        },
        onFormSubmit: function() {
          console.info('[HubSpot Modal] Form submitted');
        },
        onFormSubmitted: function() {
          console.info('[HubSpot Modal] Form submission confirmed');
          // Close modal after short delay
          setTimeout(() => {
            closeModal();
          }, 1500);
        },
      });
    } catch (error) {
      console.error('[HubSpot Modal] Form creation failed:', error);
      showState('error');
    }
  }

  // ============================================================================
  // Modal Control
  // ============================================================================

  /**
   * Opens the modal with pre-populated GPU configuration
   * @param {string} gpuType - GPU type (e.g., 'A100', 'H100')
   */
  function openModal(gpuType) {
    if (!elements.modal) return;

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

    // Show modal
    elements.modal.showModal();
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
