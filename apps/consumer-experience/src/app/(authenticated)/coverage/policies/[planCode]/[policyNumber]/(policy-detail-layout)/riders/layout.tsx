import { PropsWithChildren, Suspense } from "react";

import Loading from "@/app/loading";
import { CallForAssistance } from "@/components/call-for-assistance/CallForAssistance";

export default function RiderLayout({ children }: PropsWithChildren) {
  return (
    <div className="container">
      <p>
        <span className="typography-content-body-sm-bold">What's a rider?</span>{' '}
        A rider is an add-on to your insurance coverage. Riders are designed to
        offer additional types of coverage for certain circumstances. They often
        (but not always) cost extra. They can provide major benefits if and when
        you need them. You can learn more about what your riders cover in your
        policy documents.
      </p>
      <Suspense fallback={<Loading />}>
        {children}
      </Suspense>
      <CallForAssistance
        callToAction="Online claims are coming soon. For now,"
        contactPrompt="call"
        customInstruction="to make a rider claim."
      />
    </div>
  );
}
