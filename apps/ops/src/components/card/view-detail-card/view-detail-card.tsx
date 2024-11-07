import Typography, { TypographyVariant } from "@deps/components/typography/typography";
interface ViewDetailCardProps {
  label: string;
  value: string;
}
function ViewDetailCard({label,value}:ViewDetailCardProps) {

  return (
    <div>
        <div className=' gap-3 align-bottom p-5 border-gray-100 border rounded-md m-2'>

<Typography variant={TypographyVariant.H4} className="line-clamp-5 break-normal text-gray-500">
      {label}
</Typography>
<Typography variant={TypographyVariant.Body} className="line-clamp-5 break-normal  ">
{value}
</Typography>
</div>


    </div>
  )
}

export default ViewDetailCard
