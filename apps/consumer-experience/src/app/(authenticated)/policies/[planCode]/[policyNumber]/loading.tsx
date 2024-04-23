import { Loader } from '@zinnia/bloom/internal/components';

export default function Loading() {
  return (
    <div className="container">
      <div
        style={{
          height: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Loader />
      </div>
    </div>
  );
}
