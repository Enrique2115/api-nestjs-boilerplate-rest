import { File } from '@nest-lab/fastify-multer';
import { UploadApiResponse } from 'cloudinary';

import { MediaService } from '@src/core/media/application';
import { MediaController } from '@src/core/media/presentation';

import { createMock, Mock } from '@tests/utils/mock';

describe('MediaController', () => {
  let controller: MediaController;
  let mediaService: Mock<MediaService>;

  beforeEach(() => {
    mediaService = createMock<MediaService>();
    controller = new MediaController(mediaService);
  });

  describe('uploadFile', () => {
    it('should return ok', () => {
      expect(controller.uploadFile).toBeDefined();
    });

    it('should upload single valid file successfully', async () => {
      const file = createMock<File>();
      const folder = 'folder';
      const response = createMock<UploadApiResponse>();
      mediaService.uploadFile.mockResolvedValue(response);
      const result = await controller.uploadFile(file, folder);
      const expectedResult = {
        public_id: response.public_id,
        url: response.secure_url,
      };
      expect(result).toEqual(expectedResult);
    });

    it('should throw error when uploading single file exceeding max size', async () => {
      const file = createMock<File>();
      const folder = 'folder';
      mediaService.uploadFile.mockRejectedValue(new Error('File too large'));
      try {
        await controller.uploadFile(file, folder);
      } catch (error) {
        const expectedError = new Error('File too large');
        expect(error).toEqual(expectedError);
      }
    });
  });

  describe('uploadFiles', () => {
    it('should return ok', () => {
      expect(controller.uploadFiles).toBeDefined();
    });

    it('should upload multiple valid files successfully', async () => {
      const files = [createMock<File>(), createMock<File>()];
      const folder = 'folder';
      const response = createMock<UploadApiResponse[]>();
      mediaService.uploadFiles.mockResolvedValue(response);
      const result = await controller.uploadFiles(files, folder);
      const expectedResult = response.map(item => {
        return {
          public_id: item.public_id,
          url: item.secure_url,
        };
      });

      expect(result).toEqual(expectedResult);
    });
  });
});
