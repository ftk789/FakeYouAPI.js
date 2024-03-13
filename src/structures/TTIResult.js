const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const randomUUID = uuidv4();
let width;
let height;

function generateRandomSeed() {
  const digits = 10;
  let seed = '';
  for (let i = 0; i < digits; i++) {
    seed += Math.floor(Math.random() * 10);
  }
  return parseInt(seed);
}


const statusChecks = {
    "ATTEMPT_FAILED": "Image Generation Attempt Unsuccessful",
    "COMPLETE_FAILURE": "Image Generation Failed",
    "COMPLETE_SUCCESS": "Image Generation Complete",
    "DEAD": "Image Generation Dead",
    "PENDING": "Pending Image Generation",
    "STARTED": "Image Generation in Progress",
    "UNKNOWN": "Image Generation Status Unknown"
};

async function checkJobStatus(jobToken) {
    try {
        const response = await axios.get(`https://api.fakeyou.com/v1/model_inference/job_status/${jobToken}`, {
            headers: {
                "accept": "application/json",
            }
        });

        const { success, state } = response.data;
        if (!success || !state) {
            throw new Error('Invalid response format');
        }

        const { status } = state;
        if (!status || !status.status) {
            throw new Error('Invalid status format');
        }

        const statusKey = status.status.toUpperCase();
        const statusText = statusChecks[statusKey] || statusChecks.UNKNOWN;

        return { success: true, status: statusText, data: state };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function performJobStatusCheck(jobToken) {
  let statusLogged = false;
  try {
      let result = await checkJobStatus(jobToken);
      while (result.success && (result.status === statusChecks.STARTED || result.status === statusChecks.PENDING)) {
          if (!statusLogged) {
              console.log(`Job Status: ${result.status}, waiting for completion...`);
              statusLogged = true;
          }
          await new Promise(resolve => setTimeout(resolve, 5000));
          result = await checkJobStatus(jobToken);
      }

      if (result.success) {
          batchToken = result.data.maybe_result.entity_token;
          const imagesResponse = await fetchBatchToken(batchToken);
          if (imagesResponse.success) {
              return imagesResponse.images;
          } else {
              console.error('Error:', imagesResponse);
              return null;
          }
      } else {
          console.error('Error:', result.error);
          return null;
      }
  } catch (err) {
      console.error('Error:', err);
      return null;
  }
}

async function fetchImages(ImageBatchToken) {
    const batchURL = `https://api.fakeyou.com/v1/media_files/batch/${ImageBatchToken}`;
    try {
        const imagesResponse = await axios.get(batchURL, {
            headers: {
                "accept": "application/json",
            }
        });
        const results = imagesResponse.data.results;
        const imageUrls = results.map(result => "https://storage.googleapis.com/vocodes-public" + result.public_bucket_path);
        return { success: true, images: imageUrls, data: results };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function fetchBatchToken(batchToken) {
    const batchURL = `https://api.fakeyou.com/v1/media_files/file/${batchToken}`;
    try {
        const response = await axios.get(batchURL, {
            headers: {
                "accept": "application/json",
            }
        });
        const ImageBatchToken = response.data.media_file.maybe_batch_token;
        return fetchImages(ImageBatchToken);
    } catch (error) {
        return { success: false, error: error.message };
    }
}

class TTIResult {
  async getTTIModelsWeights() {
    try {
      const response = await axios.get('https://api.fakeyou.com/v1/weights/list');
      const responseData = response.data;

      if (responseData.success) {
          const results = responseData.results;
          const weightInfo = results.map(result => ({
              title: result.title,
              weight_token: result.weight_token
          }));
          return weightInfo;
      } else {
          throw new Error('Request was not successful');
      }
  } catch (error) {
      console.error('Error fetching weight data:', error.message);
      return [];
  }
  }
    async TTIRequest(model, text, LoraModel, NegativeText, seed, imageShape, sampler, CGF_Scale, SamplesNumber, BatchCount) {
        if (!model) return "No model token provided.";
        if (!text) return "No text prompt provided.";
        if (!LoraModel) LoraModel = null;
        if (!NegativeText) NegativeText = '';
        if (!seed || isNaN(seed)) seed = generateRandomSeed();
        if (!sampler) sampler = 'DPM++ 2M Karras';
        if (!CGF_Scale || isNaN(CGF_Scale)) CGF_Scale = 7;
        if (!SamplesNumber || isNaN(SamplesNumber)) SamplesNumber = 8;
        if (!BatchCount || isNaN(BatchCount)) BatchCount = 3;

        if (!imageShape || imageShape.toLowerCase() === "square") {
            width = 512;
            height = 512;
        } else if (imageShape.toLowerCase() === "landscape") {
            width = 768;
            height = 512;
        } else if (imageShape.toLowerCase() === "portrait") {
            width = 512;
            height = 768;
        }
        const apiUrl = 'https://api.fakeyou.com/v1/image_gen/enqueue/inference';
        const requestData = {
            uuid_idempotency_token: randomUUID,
            maybe_sd_model_token: model,
            maybe_lora_model_token: LoraModel,
            maybe_prompt: text,
            maybe_n_prompt: NegativeText,
            maybe_seed: seed,
            maybe_width: width,
            maybe_height: height,
            maybe_sampler: sampler,
            maybe_cfg_scale: CGF_Scale,
            maybe_number_of_samples: SamplesNumber,
            maybe_batch_count: BatchCount
        };

        try {
            const response = await axios.post(apiUrl, requestData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status !== 200) {
                throw new Error(`Failed to fetch: ${response.statusText}`);
            }

            const responseData = response.data;
            if (responseData.success) {
                var JobResponse = await performJobStatusCheck(responseData.inference_job_token);
                return JobResponse;
            } else {
                throw new Error('API request failed');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }
}

module.exports = TTIResult;
