import Webcam from 'react-webcam';

interface WebcamLayerProps {
  webcamRef: React.RefObject<Webcam | null>;
  onVideoLoad?: () => void;
}

export const WebcamLayer = ({ webcamRef, onVideoLoad }: WebcamLayerProps) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black flex items-center justify-center">
      <Webcam
        ref={webcamRef}
        onUserMedia={onVideoLoad}
        audio={false}
        className="w-full h-full object-cover transform scale-x-[-1]"
        videoConstraints={{
          facingMode: 'user',
          width: 1280,
          height: 720
        }}
      />
    </div>
  );
};
